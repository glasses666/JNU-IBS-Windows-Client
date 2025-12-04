import tkinter as tk
from tkinter import ttk, messagebox
import requests
import json
import base64
import threading
import math
import time
from datetime import datetime, timedelta
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

    def fetch_overview(self):
        info = self.post('GetUserInfo')
        allowance = self.post('GetSubsidy', {'startDate': '2000-01-01', 'endDate': '2099-12-31'})
        bill = self.post('GetBillCost', {'energyType': 0, 'startDate': '2000-01-01', 'endDate': '2099-12-31'})
        return self.parse_overview(info, allowance, bill)

    def fetch_records(self, page=1, count=20):
        # API: GetPaymentRecord
        payload = {'startIdx': (page - 1) * count, 'recordCount': count}
        resp = self.post('GetPaymentRecord', payload)
        return resp.get('d', {}).get('ResultList', [])

    def fetch_trends(self):
        # API: GetCustomerMetricalData
        # Fetch current month data
        now = datetime.now()
        start_date = now.replace(day=1).strftime('%Y-%m-%d')
        end_date = now.strftime('%Y-%m-%d')
        
        payload = {
            'startDate': start_date,
            'endDate': end_date,
            'interval': 1, # Daily
            'energyType': 0 # All
        }
        resp = self.post('GetCustomerMetricalData', payload)
        return resp.get('d', {}).get('ResultList', [])

    def parse_overview(self, info_resp, allowance_resp, bill_resp):
        data = {}
        # Room & Balance
        try:
            room_info = info_resp.get('d', {}).get('ResultList', [])[0]['roomInfo']
            data['room'] = room_info[0]['keyValue']
            data['balance'] = float(room_info[1]['keyValue'])
        except:
            data['room'] = "未知"
            data['balance'] = 0.0

        # Helper
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

        data['costs'] = {'elec': e_cost, 'cold': c_cost, 'hot': h_cost, 'total': e_cost + c_cost + h_cost}
        data['details'] = {'elec': (e_use, e_price), 'cold': (c_use, c_price), 'hot': (h_use, h_price)}
        return data

# UI Components
class DonutChart(tk.Canvas):
    def __init__(self, master, **kwargs):
        super().__init__(master, **kwargs)
        self.configure(bg='white', highlightthickness=0)
        self.arc_ids = []
        self.text_id = None
        self.target_angles = [] 

    def draw_chart(self, values, total_balance, colors):
        self.delete("all")
        self.arc_ids = []
        self.target_angles = []
        self.update_idletasks()
        
        width = self.winfo_width() or 300
        height = self.winfo_height() or 300
        x, y = width / 2, height / 2
        radius = min(width, height) * 0.35
        thickness = 40
        
        self.create_oval(x-radius, y-radius, x+radius, y+radius, outline="#f0f0f0", width=thickness)
        
        total_val = sum(values)
        start_angle = 90
        
        if total_val > 0.01:
            current_angle = start_angle
            for i, v in enumerate(values):
                extent = (v / total_val) * 360
                self.target_angles.append((current_angle, -extent))
                arc = self.create_arc(x-radius, y-radius, x+radius, y+radius,
                                      start=current_angle, extent=0,
                                      outline=colors[i], width=thickness, style="arc")
                self.arc_ids.append(arc)
                current_angle -= extent
        else:
            for i in range(3):
                 self.create_arc(x-radius, y-radius, x+radius, y+radius,
                                start=90 - i*120, extent=-110,
                                outline="#e0e0e0", width=thickness, style="arc")

        self.text_id = self.create_text(x, y-15, text="--", font=("Helvetica", 28, "bold"), fill="#333")
        self.create_text(x, y+25, text="当前余额", font=("Microsoft YaHei", 10), fill="#888")
        
        self.target_balance = total_balance
        self.animate(0)

    def animate(self, step):
        if step > 100: return
        progress = 1 - math.pow(1 - step/100, 3)
        for i, (start, full_extent) in enumerate(self.target_angles):
            if i < len(self.arc_ids):
                self.itemconfig(self.arc_ids[i], extent=full_extent * progress)
        self.itemconfig(self.text_id, text=f"¥{self.target_balance * progress:.2f}")
        self.after(16, lambda: self.animate(step + 2))

class LineChart(tk.Canvas):
    def __init__(self, master, **kwargs):
        super().__init__(master, **kwargs)
        self.configure(bg='white', highlightthickness=0)

    def draw_data(self, trend_list):
        self.delete("all")
        self.update_idletasks()
        w, h = self.winfo_width(), self.winfo_height()
        pad = 30
        
        # Sort data by date
        # Assuming trend_list is [ {'date': 'd', 'val': 1.0}, ... ]
        if not trend_list:
            self.create_text(w/2, h/2, text="暂无本月数据", fill="#999")
            return

        dates = [d['date'] for d in trend_list]
        values = [d['val'] for d in trend_list]
        max_val = max(values) if values else 10
        if max_val == 0: max_val = 10
        
        # Draw Axes
        self.create_line(pad, h-pad, w-pad, h-pad, fill="#ccc") # X
        # self.create_line(pad, pad, pad, h-pad, fill="#ccc") # Y
        
        # Plot
        step_x = (w - 2*pad) / (len(values) - 1) if len(values) > 1 else 0
        points = []
        
        for i, val in enumerate(values):
            x = pad + i * step_x
            y = (h - pad) - (val / max_val) * (h - 2*pad)
            points.append((x, y))
            
            # Dot
            self.create_oval(x-3, y-3, x+3, y+3, fill="#007AFF", outline="")
            
            # Label
            if len(values) < 10 or i % 3 == 0: # Avoid crowding
                self.create_text(x, h-pad+15, text=dates[i][-2:], font=("Arial", 8), fill="#666")

        if len(points) > 1:
            self.create_line(points, fill="#007AFF", width=2, smooth=True)

class App:
    def __init__(self, root):
        self.root = root
        self.root.title("JNU 水电费助手 V18")
        self.root.geometry("450x700")
        self.root.configure(bg="white")
        
        # Login Frame
        frame_login = tk.Frame(root, bg="white", pady=10)
        frame_login.pack(fill=tk.X, padx=20)
        
        ttk.Label(frame_login, text="房间号:", background="white", font=("Microsoft YaHei", 12)).pack(side=tk.LEFT)
        self.entry_room = ttk.Entry(frame_login, font=("Helvetica", 12), width=10)
        self.entry_room.pack(side=tk.LEFT, padx=10)
        self.entry_room.bind('<Return>', lambda e: self.run())
        
        self.btn_query = tk.Button(frame_login, text="查询", bg="#007AFF", fg="white", 
                              font=("Microsoft YaHei", 10), relief="flat", padx=15,
                              command=self.run)
        self.btn_query.pack(side=tk.LEFT)

        # Notebook (Tabs)
        style = ttk.Style()
        style.configure("TNotebook", background="white")
        style.configure("TNotebook.Tab", padding=[10, 5], font=("Microsoft YaHei", 10))
        
        self.notebook = ttk.Notebook(root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Tab 1: Overview
        self.tab_overview = tk.Frame(self.notebook, bg="white")
        self.notebook.add(self.tab_overview, text="概览")
        self.setup_overview_tab()
        
        # Tab 2: Trends
        self.tab_trends = tk.Frame(self.notebook, bg="white")
        self.notebook.add(self.tab_trends, text="每日用量")
        self.setup_trends_tab()
        
        # Tab 3: Records
        self.tab_records = tk.Frame(self.notebook, bg="white")
        self.notebook.add(self.tab_records, text="充值记录")
        self.setup_records_tab()

    def setup_overview_tab(self):
        self.chart = DonutChart(self.tab_overview, width=300, height=300, bg="white")
        self.chart.pack(pady=10)
        
        self.frame_stats = tk.Frame(self.tab_overview, bg="white")
        self.frame_stats.pack(fill=tk.BOTH, expand=True, padx=20)
        
        headers = ["类型", "用量", "单价", "预估费用", "日均"]
        for i, h in enumerate(headers):
            tk.Label(self.frame_stats, text=h, bg="white", fg="#888", font=("Microsoft YaHei", 9)).grid(row=0, column=i, padx=5, pady=5, sticky="w")

    def setup_trends_tab(self):
        tk.Label(self.tab_trends, text="本月每日电量趋势 (度)", bg="white", font=("Microsoft YaHei", 10, "bold")).pack(pady=10)
        self.chart_elec = LineChart(self.tab_trends, width=380, height=150, bg="white")
        self.chart_elec.pack()
        
        tk.Label(self.tab_trends, text="本月每日用水趋势 (吨)", bg="white", font=("Microsoft YaHei", 10, "bold")).pack(pady=10)
        self.chart_water = LineChart(self.tab_trends, width=380, height=150, bg="white")
        self.chart_water.pack()

    def setup_records_tab(self):
        cols = ("time", "type", "amount")
        self.tree = ttk.Treeview(self.tab_records, columns=cols, show='headings', height=20)
        self.tree.heading("time", text="时间")
        self.tree.heading("type", text="类型")
        self.tree.heading("amount", text="金额")
        
        self.tree.column("time", width=140)
        self.tree.column("type", width=100)
        self.tree.column("amount", width=80)
        
        self.tree.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    def run(self):
        room = self.entry_room.get().strip()
        if not room: return
        self.btn_query.config(state=tk.DISABLED)
        
        def _task():
            try:
                client = IBSClient()
                client.login_legacy(room)
                
                # 1. Fetch Overview
                data = client.fetch_overview()
                self.root.after(0, lambda: self.update_overview(data))
                
                # 2. Fetch Records (Async)
                records = client.fetch_records()
                self.root.after(0, lambda: self.update_records(records))
                
                # 3. Fetch Trends (Async)
                trends = client.fetch_trends()
                self.root.after(0, lambda: self.update_trends(trends))
                
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("错误", str(e)))
            finally:
                self.root.after(0, lambda: self.btn_query.config(state=tk.NORMAL))
                
        threading.Thread(target=_task, daemon=True).start()

    def update_overview(self, data):
        # Update Chart
        colors = ["#FF9500", "#5AC8FA", "#FF2D55"]
        costs = [data['costs']['elec'], data['costs']['cold'], data['costs']['hot']]
        self.chart.draw_chart(costs, data['balance'], colors)
        
        # Update Grid
        # Clear old rows (keep header)
        for w in self.frame_stats.winfo_children():
            if int(w.grid_info()['row']) > 0: w.destroy()
            
        types = [
            ("电费", colors[0], data['costs']['elec'], data['details']['elec'], "度"),
            ("冷水", colors[1], data['costs']['cold'], data['details']['cold'], "吨"),
            ("热水", colors[2], data['costs']['hot'], data['details']['hot'], "吨")
        ]
        day = datetime.now().day
        
        for i, (name, color, cost, details, unit) in enumerate(types):
            row = i + 1
            f = tk.Frame(self.frame_stats, bg="white")
            f.grid(row=row, column=0, sticky="w", pady=5)
            tk.Canvas(f, width=10, height=10, bg=color, highlightthickness=0).pack(side=tk.LEFT, padx=5)
            tk.Label(f, text=name, bg="white", font=("Microsoft YaHei", 11)).pack(side=tk.LEFT)
            
            usage, price = details
            tk.Label(self.frame_stats, text=f"{usage:.2f} {unit}", bg="white", font=("Helvetica", 10)).grid(row=row, column=1, sticky="w")
            tk.Label(self.frame_stats, text=f"¥{price:.3f}", bg="white", fg="#666", font=("Helvetica", 9)).grid(row=row, column=2, sticky="w")
            tk.Label(self.frame_stats, text=f"¥{cost:.2f}", bg="white", font=("Helvetica", 10, "bold")).grid(row=row, column=3, sticky="w")
            
            avg = cost / day if day > 0 else 0
            tk.Label(self.frame_stats, text=f"¥{avg:.2f}", bg="white", fg="#666", font=("Helvetica", 9)).grid(row=row, column=4, sticky="w")

    def update_records(self, records):
        self.tree.delete(*self.tree.get_children())
        for r in records:
            # logTime is timestamp in ms
            ts = int(r.get('logTime', 0)) / 1000
            dt = datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M')
            
            type_str = f"{r.get('paymentType')} ({r.get('itemType')})"
            amount = r.get('dataValue')
            self.tree.insert("", "end", values=(dt, type_str, amount))

    def update_trends(self, result_list):
        # Extract Elec (2) and Water (3+4)
        elec_data = []
        water_data = []
        
        # result_list is like [{'energyType': 2, 'datas': [...]}, ...]
        for item in result_list:
            etype = item.get('energyType')
            datas = item.get('datas', [])
            
            series = []
            for d in datas:
                # recordTime in ms
                ts = int(d.get('recordTime', 0)) / 1000
                date_str = datetime.fromtimestamp(ts).strftime('%d') # Just day
                val = float(d.get('dataValue', 0))
                series.append({'date': date_str, 'val': val})
            
            series.sort(key=lambda x: x['date'])
            
            if etype == 2:
                elec_data = series
            elif etype == 3: # Cold water
                # Merge into water_data? Or just plot cold.
                # Let's plot cold for now.
                water_data = series
                
        self.chart_elec.draw_data(elec_data)
        self.chart_water.draw_data(water_data)

if __name__ == "__main__":
    root = tk.Tk()
    app = App(root)
    root.mainloop()
