import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import requests
import json
import base64
import threading
from datetime import datetime
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

# Configuration
# We use the NEW domain, but the OLD authentication logic
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
        # Pad with PKCS7 (block size 16)
        padded_data = pad(text.encode('utf-8'), AES.block_size)
        return cipher.encrypt(padded_data)

    def login_legacy(self, room):
        # The old logic:
        # 1. Encrypt room name as password
        # 2. Call Login API
        # This might fail if CAS is enforced, but let's try.
        
        room = room.upper()
        encrypted_room = self.encrypt(room)
        password_b64 = base64.b64encode(encrypted_room).decode('utf-8')
        
        payload = {
            'user': room,
            'password': password_b64
        }
        
        try:
            print(f"Attempting Legacy Login for {room}...")
            resp = self.session.post(BASE_URL + 'Login', json=payload, timeout=10)
            
            # Check if we got a 200 OK JSON
            try:
                data = resp.json()
            except:
                # If it returns HTML (CAS page), then this method failed
                raise Exception("Server returned HTML (likely CAS redirect). Legacy login blocked.")

            if not data.get('d', {}).get('Success'):
                raise Exception(f"Login Failed: {data.get('d', {}).get('Msg')}")
            
            self.user_id = data['d']['ResultList'][0]['customerId']
            print(f"Legacy Login Success! UserID: {self.user_id}")
            return True
            
        except Exception as e:
            raise Exception(f"Legacy Login Error: {e}")

    def get_headers(self):
        if not self.user_id:
            raise Exception("Not logged in")
            
        now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        token_payload = json.dumps({
            'userID': self.user_id,
            'tokenTime': now_str
        })
        encrypted_token = self.encrypt(token_payload)
        token_b64 = base64.b64encode(encrypted_token).decode('utf-8')
        
        return {
            'Token': token_b64,
            'DateTime': now_str
        }

    def fetch_data(self):
        headers = self.get_headers()
        
        def post(endpoint, body=None):
            # Merge headers
            req_headers = self.session.headers.copy()
            req_headers.update(headers)
            resp = self.session.post(BASE_URL + endpoint, json=body or {}, headers=req_headers, timeout=10)
            resp.raise_for_status()
            return resp.json()

        print("正在获取详细数据...")
        info = post('GetUserInfo')
        allowance = post('GetSubsidy', {'startDate': '2000-01-01', 'endDate': '2099-12-31'})
        bill = post('GetBillCost', {'energyType': 0, 'startDate': '2000-01-01', 'endDate': '2099-12-31'})
        
        return self.format_report(info, allowance, bill)

    def format_report(self, info_resp, allowance_resp, bill_resp):
        data = {}
        
        # 1. Parse Balance & Room
        try:
            room_info = info_resp.get('d', {}).get('ResultList', [])[0]['roomInfo']
            data['room'] = room_info[0]['keyValue']
            data['balance'] = room_info[1]['keyValue']
        except:
            data['room'] = "未知"
            data['balance'] = "0"

        # 2. Helper to find item type
        def find_item(lst, type_id):
            if not lst: return None
            for x in lst:
                if str(x.get('energyType')) == str(type_id) or str(x.get('itemType')) == str(type_id):
                    return x
            return None

        bill_list = bill_resp.get('d', {}).get('ResultList', [])
        sub_list = allowance_resp.get('d', {}).get('ResultList', [])

        elec_bill = find_item(bill_list, 2)
        water_bill = find_item(bill_list, 3)
        hot_bill = find_item(bill_list, 4)
        
        elec_sub = find_item(sub_list, 2)
        water_sub = find_item(sub_list, 3)
        hot_sub = find_item(sub_list, 4)

        # 3. Format String
        report = f"房间: {data['room']}\n"
        report += f"余额: {data['balance']} 元\n"
        report += "=" * 30 + "\n\n"

        def fmt_usage(bill_item, sub_item, name, unit):
            usage = "0"
            price = "0"
            avail = "0"
            total = "0"
            
            if bill_item:
                price = bill_item.get('unitPrice', 0)
                if bill_item.get('energyCostDetails'):
                    vals = bill_item['energyCostDetails'][0].get('billItemValues')
                    if vals: usage = vals[0].get('energyValue', 0)
            
            if sub_item:
                avail = sub_item.get('avalibleValue', 0)
                total = sub_item.get('totalValue', 0)
            
            return f"【{name}】\n  用量: {usage} {unit}\n  补贴(余/总): {avail}/{total} {unit}\n  单价: {price} 元\n"

        report += fmt_usage(elec_bill, elec_sub, "电费", "度") + "\n"
        report += fmt_usage(water_bill, water_sub, "冷水", "吨") + "\n"
        report += fmt_usage(hot_bill, hot_sub, "热水", "吨")
        
        return report

class App:
    def __init__(self, root):
        self.root = root
        self.root.title("JNU 水电费查询 (极速接口版)")
        self.root.geometry("500x600")
        
        frame_top = ttk.Frame(root, padding=10)
        frame_top.pack(fill=tk.X)
        
        ttk.Label(frame_top, text="房间号 (例如 T8201):").pack(side=tk.LEFT)
        self.entry_room = ttk.Entry(frame_top, width=15)
        self.entry_room.pack(side=tk.LEFT, padx=10)
        # Add Enter key binding
        self.entry_room.bind('<Return>', lambda e: self.run())
        
        self.btn = ttk.Button(frame_top, text="立即查询", command=self.run)
        self.btn.pack(side=tk.LEFT)
        
        self.txt = scrolledtext.ScrolledText(root, wrap=tk.WORD, font=('Microsoft YaHei', 10))
        self.txt.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
    def run(self):
        room = self.entry_room.get().strip()
        if not room: return
        
        self.btn.config(state=tk.DISABLED)
        self.txt.delete(1.0, tk.END)
        self.txt.insert(tk.END, f"正在连接旧版接口查询 {room}...\n")
        
        def _task():
            try:
                client = IBSClient()
                client.login_legacy(room)
                report = client.fetch_data()
                self.root.after(0, lambda: self.txt.insert(tk.END, "\n" + report))
            except Exception as e:
                self.root.after(0, lambda: self.txt.insert(tk.END, f"\n查询失败: {e}\n请检查房间号是否正确，或确认是否已连接校园网。"))
            finally:
                self.root.after(0, lambda: self.btn.config(state=tk.NORMAL))
                
        threading.Thread(target=_task, daemon=True).start()

if __name__ == "__main__":
    root = tk.Tk()
    app = App(root)
    root.mainloop()
