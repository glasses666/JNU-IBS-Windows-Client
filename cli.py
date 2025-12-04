import requests
import json
import base64
import sys
from datetime import datetime
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

# Configuration
BASE_URL = 'https://pynhcx.jnu.edu.cn/IBSjnuweb/WebService/JNUService.asmx/'
KEY = b'CetSoftEEMSysWeb'
IV = b'\x19\x34\x57\x72\x90\xAB\xCD\xEF\x12\x64\x14\x78\x90\xAC\xAE\x45'

class IBSClient:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) IBSJnuClient/1.0'
        })
        self.session.verify = False
        self.user_id = None

    def encrypt(self, text):
        cipher = AES.new(KEY, AES.MODE_CBC, IV)
        padded_data = pad(text.encode('utf-8'), AES.block_size)
        return cipher.encrypt(padded_data)

    def login_legacy(self, room):
        room = room.upper()
        encrypted_room = self.encrypt(room)
        password_b64 = base64.b64encode(encrypted_room).decode('utf-8')
        
        payload = {'user': room, 'password': password_b64}
        
        try:
            resp = self.session.post(BASE_URL + 'Login', json=payload, timeout=10)
            data = resp.json()
            if not data.get('d', {}).get('Success'):
                raise Exception(f"Login Failed: {data.get('d', {}).get('Msg')}")
            self.user_id = data['d']['ResultList'][0]['customerId']
            return True
        except Exception as e:
            raise Exception(f"Legacy Login Error: {e}")

    def get_headers(self):
        if not self.user_id: raise Exception("Not logged in")
        now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        token_payload = json.dumps({'userID': self.user_id, 'tokenTime': now_str})
        token = base64.b64encode(self.encrypt(token_payload)).decode('utf-8')
        return {'Token': token, 'DateTime': now_str}

    def post(self, endpoint, body=None):
        headers = self.get_headers()
        req_headers = self.session.headers.copy()
        req_headers.update(headers)
        resp = self.session.post(BASE_URL + endpoint, json=body or {}, headers=req_headers, timeout=10)
        resp.raise_for_status()
        return resp.json()

    def fetch_all_data(self):
        # 1. Overview
        info = self.post('GetUserInfo')
        allowance = self.post('GetSubsidy', {'startDate': '2000-01-01', 'endDate': '2099-12-31'})
        bill = self.post('GetBillCost', {'energyType': 0, 'startDate': '2000-01-01', 'endDate': '2099-12-31'})
        overview = self.parse_overview(info, allowance, bill)

        # 2. Records (Last 10)
        records_resp = self.post('GetPaymentRecord', {'startIdx': 0, 'recordCount': 10})
        records = records_resp.get('d', {}).get('ResultList', [])

        # 3. Trends (Current Month)
        now = datetime.now()
        start_date = now.replace(day=1).strftime('%Y-%m-%d')
        end_date = now.strftime('%Y-%m-%d')
        trends_resp = self.post('GetCustomerMetricalData', {
            'startDate': start_date,
            'endDate': end_date,
            'interval': 1, 
            'energyType': 0
        })
        trends = trends_resp.get('d', {}).get('ResultList', [])

        return {
            "overview": overview,
            "records": records,
            "trends": trends
        }

    def parse_overview(self, info_resp, allowance_resp, bill_resp):
        data = {}
        try:
            room_info = info_resp.get('d', {}).get('ResultList', [])[0]['roomInfo']
            data['room'] = room_info[0]['keyValue']
            data['balance'] = float(room_info[1]['keyValue'])
        except:
            data['room'] = "Unknown"
            data['balance'] = 0.0

        def find_item(lst, type_id):
            if not lst: return None
            for x in lst:
                if str(x.get('energyType')) == str(type_id) or str(x.get('itemType')) == str(type_id):
                    return x
            return None

        bill_list = bill_resp.get('d', {}).get('ResultList', [])
        sub_list = allowance_resp.get('d', {}).get('ResultList', [])
        RATES = {2: 0.647, 3: 2.82, 4: 25.0}

        def get_details(type_id):
            usage = 0.0
            bill_item = find_item(bill_list, type_id)
            if bill_item and bill_item.get('energyCostDetails'):
                details = bill_item['energyCostDetails']
                if len(details) > 0:
                    vals = details[0].get('billItemValues')
                    if vals and len(vals) > 0:
                         usage = float(vals[0].get('energyValue', 0))
            
            price = float(bill_item.get('unitPrice', 0)) if bill_item else 0.0
            if price <= 0.001: price = RATES.get(type_id, 0.0)
            
            cost = usage * price
            return round(cost, 2), usage, price

        e_cost, e_use, e_price = get_details(2)
        c_cost, c_use, c_price = get_details(3)
        h_cost, h_use, h_price = get_details(4)

        data['costs'] = {'elec': e_cost, 'cold': c_cost, 'hot': h_cost, 'total': round(e_cost + c_cost + h_cost, 2)}
        data['details'] = {'elec': (e_use, e_price), 'cold': (c_use, c_price), 'hot': (h_use, h_price)}
        return data

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python cli.py <RoomNumber>")
        print("Example: python cli.py T8201")
        sys.exit(1)

    room = sys.argv[1]
    
    try:
        client = IBSClient()
        client.login_legacy(room)
        data = client.fetch_all_data()
        
        # Output strictly JSON for easy parsing by other tools
        print(json.dumps(data, indent=4, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(1)
