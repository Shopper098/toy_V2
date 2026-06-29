/*
  ไฟล์ google-apps-script.js

  วิธีใช้:
  1) สร้าง Google Sheet ใหม่
  2) ตั้งชื่อชีตว่า transactions
  3) แถวที่ 1 ใส่หัวตาราง:
     id | date | type | channel | product | category | amount | fee | net | note | createdAt | serverTime
  4) ไปที่ Extensions > Apps Script
  5) ลบโค้ดเดิม แล้ววางโค้ดนี้
  6) กด Deploy > New deployment > Web app
  7) Execute as: Me
  8) Who has access: Anyone
  9) Copy URL ที่ลงท้าย /exec ไปใส่ในหน้า ตั้งค่า ของเว็บ
*/

const SHEET_NAME = "transactions";

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.id,
    data.date,
    data.type,
    data.channel,
    data.product,
    data.category,
    data.amount,
    data.fee,
    data.net,
    data.note,
    data.createdAt,
    new Date()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({
      result: "success",
      message: "saved"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput("Toy Shop Money API is running")
    .setMimeType(ContentService.MimeType.TEXT);
}
