# Toy Shop Money App

เว็บแอปบันทึกรายรับรายจ่ายร้านของเล่น

## ไฟล์ในโปรเจกต์

- `index.html` หน้าเว็บหลัก
- `style.css` ไฟล์ตกแต่งหน้าตา
- `app.js` ระบบบันทึกข้อมูลและกราฟ
- `google-apps-script.js` โค้ดสำหรับ Google Sheet

## วิธีอัปขึ้น GitHub Pages

1. สร้าง Repository ใหม่ใน GitHub
2. อัปโหลดไฟล์ทั้งหมด
3. ไปที่ Settings > Pages
4. Source: Deploy from a branch
5. Branch: main
6. Folder: /root
7. กด Save

## วิธีเชื่อม Google Sheet

1. สร้าง Google Sheet
2. ตั้งชื่อชีตว่า `transactions`
3. แถวแรกใส่หัวตาราง:

id | date | type | channel | product | category | amount | fee | net | note | createdAt | serverTime

4. ไปที่ Extensions > Apps Script
5. วางโค้ดจากไฟล์ `google-apps-script.js`
6. Deploy เป็น Web app
7. เลือก Anyone
8. Copy URL ที่ลงท้าย `/exec`
9. เปิดเว็บ > เมนูตั้งค่า > วาง URL > บันทึก

## หมายเหตุ

ข้อมูลจะถูกเก็บ 2 ที่:
- ใน Browser ด้วย localStorage
- ใน Google Sheet เมื่อใส่ Apps Script URL แล้ว
