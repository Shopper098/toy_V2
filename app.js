/* ======================================================
   ไฟล์ app.js
   ระบบเว็บแอปบัญชีร้านของเล่น
   - บันทึกซื้อเข้า
   - บันทึกขายออนไลน์ / ขายตลาด
   - สรุปยอดขาย กำไร และกราฟ
   - ส่งข้อมูลเข้า Google Sheet ผ่าน Apps Script
====================================================== */


/* ======================================================
   1) โหลดข้อมูลจาก localStorage
   ข้อมูลส่วนนี้จะเก็บไว้ใน Browser ของเครื่องที่ใช้งาน
====================================================== */

let buys = JSON.parse(localStorage.getItem("toy_buys")) || [];
let sales = JSON.parse(localStorage.getItem("toy_sales")) || [];

/* เก็บ URL ของ Google Apps Script */
let GOOGLE_SCRIPT_URL = localStorage.getItem("google_script_url") || "";

/* ตัวแปรกราฟ */
let saleChart = null;
let channelChart = null;


/* ======================================================
   2) ตั้งค่าวันที่เริ่มต้นเป็นวันนี้
====================================================== */

const today = new Date().toISOString().split("T")[0];

document.getElementById("buyDate").value = today;
document.getElementById("saleDate").value = today;
document.getElementById("scriptUrlInput").value = GOOGLE_SCRIPT_URL;


/* ======================================================
   3) เปลี่ยนหน้าเมนู
====================================================== */

function showPage(pageId, button) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  document.querySelectorAll(".menu button").forEach(btn => btn.classList.remove("active"));

  document.getElementById(pageId).classList.add("active");
  button.classList.add("active");

  updateAll();
}


/* ======================================================
   4) ฟังก์ชันช่วยแสดงวันที่แบบไทย วัน/เดือน/ปี
====================================================== */

function formatThaiDate(dateString) {
  if (!dateString) return "-";

  const d = new Date(dateString + "T00:00:00");

  return d.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}


/* ======================================================
   5) ฟังก์ชันแสดงเงินไทย
====================================================== */

function money(value) {
  return Number(value || 0).toLocaleString("th-TH") + " บาท";
}


/* ======================================================
   6) แสดงกล่องสถานะ
====================================================== */

function showStatus(id, message, type = "ok") {
  const el = document.getElementById(id);
  el.className = "status " + type;
  el.innerText = message;

  setTimeout(() => {
    el.className = "status";
    el.innerText = "";
  }, 3000);
}


/* ======================================================
   7) บันทึก URL Apps Script
====================================================== */

function saveScriptUrl() {
  GOOGLE_SCRIPT_URL = document.getElementById("scriptUrlInput").value.trim();
  localStorage.setItem("google_script_url", GOOGLE_SCRIPT_URL);

  showStatus("settingStatus", "บันทึก URL เรียบร้อย", "ok");
}


/* ======================================================
   8) ส่งข้อมูลไป Google Sheet
   ใช้ mode no-cors เพื่อให้ GitHub Pages ส่งข้อมูลไป Apps Script ได้ง่าย
====================================================== */

function sendToGoogleSheet(data) {
  if (!GOOGLE_SCRIPT_URL) {
    console.log("ยังไม่ได้ตั้งค่า Google Apps Script URL");
    return;
  }

  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(data)
  }).catch(err => {
    console.error("ส่งข้อมูลเข้า Google Sheet ไม่สำเร็จ", err);
  });
}


/* ======================================================
   9) ทดสอบส่งข้อมูลเข้า Google Sheet
====================================================== */

function testGoogleSheet() {
  saveScriptUrl();

  if (!GOOGLE_SCRIPT_URL) {
    showStatus("settingStatus", "กรุณาใส่ URL Apps Script ก่อน", "error");
    return;
  }

  sendToGoogleSheet({
    id: Date.now(),
    date: today,
    type: "ทดสอบ",
    channel: "-",
    product: "ทดสอบระบบ",
    category: "-",
    amount: 1,
    fee: 0,
    net: 1,
    note: "ทดสอบส่งข้อมูลจากเว็บ",
    createdAt: new Date().toISOString()
  });

  showStatus("settingStatus", "ส่งข้อมูลทดสอบแล้ว ให้ไปตรวจใน Google Sheet", "ok");
}


/* ======================================================
   10) บันทึกซื้อเข้า
====================================================== */

function addBuy() {
  const date = document.getElementById("buyDate").value;
  const product = document.getElementById("buyProduct").value.trim();
  const category = document.getElementById("buyCategory").value;
  const amount = Number(document.getElementById("buyAmount").value);
  const note = document.getElementById("buyNote").value.trim();

  if (!date || !product || !amount) {
    alert("กรุณากรอก วันที่ / ชื่อสินค้า / ราคาทุน");
    return;
  }

  const item = {
    id: Date.now(),
    date,
    product,
    category,
    amount,
    note,
    createdAt: new Date().toISOString()
  };

  buys.push(item);
  localStorage.setItem("toy_buys", JSON.stringify(buys));

  sendToGoogleSheet({
    id: item.id,
    date: item.date,
    type: "ซื้อเข้า",
    channel: "-",
    product: item.product,
    category: item.category,
    amount: item.amount,
    fee: 0,
    net: item.amount,
    note: item.note,
    createdAt: item.createdAt
  });

  document.getElementById("buyProduct").value = "";
  document.getElementById("buyAmount").value = "";
  document.getElementById("buyNote").value = "";

  showStatus("buyStatus", "บันทึกซื้อเข้าเรียบร้อย", "ok");

  updateAll();
}


/* ======================================================
   11) บันทึกขายสินค้า
====================================================== */

function addSale() {
  const date = document.getElementById("saleDate").value;
  const channel = document.getElementById("saleChannel").value;
  const product = document.getElementById("saleProduct").value.trim();
  const amount = Number(document.getElementById("saleAmount").value);
  const fee = Number(document.getElementById("saleFee").value || 0);
  const note = document.getElementById("saleNote").value.trim();

  if (!date || !product || !amount) {
    alert("กรุณากรอก วันที่ / ชื่อสินค้า / ราคาขาย");
    return;
  }

  const net = amount - fee;

  const item = {
    id: Date.now(),
    date,
    channel,
    product,
    amount,
    fee,
    net,
    note,
    createdAt: new Date().toISOString()
  };

  sales.push(item);
  localStorage.setItem("toy_sales", JSON.stringify(sales));

  sendToGoogleSheet({
    id: item.id,
    date: item.date,
    type: "ขาย",
    channel: item.channel,
    product: item.product,
    category: "-",
    amount: item.amount,
    fee: item.fee,
    net: item.net,
    note: item.note,
    createdAt: item.createdAt
  });

  document.getElementById("saleProduct").value = "";
  document.getElementById("saleAmount").value = "";
  document.getElementById("saleFee").value = "0";
  document.getElementById("saleNote").value = "";

  showStatus("saleStatus", "บันทึกการขายเรียบร้อย", "ok");

  updateAll();
}


/* ======================================================
   12) ลบข้อมูล
   หมายเหตุ: ลบเฉพาะในเครื่อง localStorage
   ถ้าต้องการลบใน Google Sheet ต้องทำระบบ ID เพิ่มเติม
====================================================== */

function deleteBuy(id) {
  if (!confirm("ลบรายการซื้อเข้านี้ใช่ไหม?")) return;

  buys = buys.filter(item => item.id !== id);
  localStorage.setItem("toy_buys", JSON.stringify(buys));

  updateAll();
}

function deleteSale(id) {
  if (!confirm("ลบรายการขายนี้ใช่ไหม?")) return;

  sales = sales.filter(item => item.id !== id);
  localStorage.setItem("toy_sales", JSON.stringify(sales));

  updateAll();
}


/* ======================================================
   13) ค้นหาและแสดงตารางประวัติ
====================================================== */

function renderHistory() {
  const search = document.getElementById("searchText").value.toLowerCase();
  const filter = document.getElementById("historyFilter").value;

  let filteredBuys = buys.filter(item => {
    const text = `${item.product} ${item.category} ${item.note}`.toLowerCase();
    return text.includes(search);
  });

  let filteredSales = sales.filter(item => {
    const text = `${item.product} ${item.channel} ${item.note}`.toLowerCase();
    return text.includes(search);
  });

  if (filter === "buy") {
    filteredSales = [];
  }

  if (filter === "sale") {
    filteredBuys = [];
  }

  if (filter === "ขายออนไลน์" || filter === "ขายตลาด") {
    filteredBuys = [];
    filteredSales = filteredSales.filter(item => item.channel === filter);
  }

  document.getElementById("buyTable").innerHTML = `
    <tr>
      <th>วันที่</th>
      <th>สินค้า</th>
      <th>หมวดหมู่</th>
      <th>ต้นทุน</th>
      <th>โน้ต</th>
      <th>ลบ</th>
    </tr>
    ${
      filteredBuys.length === 0
      ? `<tr><td colspan="6">ไม่มีรายการซื้อเข้า</td></tr>`
      : filteredBuys.map(item => `
        <tr>
          <td>${formatThaiDate(item.date)}</td>
          <td>${item.product}</td>
          <td><span class="badge badge-buy">${item.category}</span></td>
          <td>${money(item.amount)}</td>
          <td>${item.note || "-"}</td>
          <td><button class="delete-btn" onclick="deleteBuy(${item.id})">ลบ</button></td>
        </tr>
      `).join("")
    }
  `;

  document.getElementById("saleTable").innerHTML = `
    <tr>
      <th>วันที่</th>
      <th>ช่องทาง</th>
      <th>สินค้า</th>
      <th>ยอดขาย</th>
      <th>ค่าธรรมเนียม</th>
      <th>สุทธิ</th>
      <th>โน้ต</th>
      <th>ลบ</th>
    </tr>
    ${
      filteredSales.length === 0
      ? `<tr><td colspan="8">ไม่มีรายการขาย</td></tr>`
      : filteredSales.map(item => `
        <tr>
          <td>${formatThaiDate(item.date)}</td>
          <td>
            <span class="badge ${item.channel === "ขายตลาด" ? "badge-market" : "badge-online"}">
              ${item.channel}
            </span>
          </td>
          <td>${item.product}</td>
          <td>${money(item.amount)}</td>
          <td>${money(item.fee)}</td>
          <td>${money(item.net)}</td>
          <td>${item.note || "-"}</td>
          <td><button class="delete-btn" onclick="deleteSale(${item.id})">ลบ</button></td>
        </tr>
      `).join("")
    }
  `;
}


/* ======================================================
   14) สร้างเลขสัปดาห์
====================================================== */

function getWeekNumber(dateString) {
  const d = new Date(dateString + "T00:00:00");
  const firstDay = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d - firstDay) / 86400000);

  return Math.ceil((days + firstDay.getDay() + 1) / 7);
}


/* ======================================================
   15) จัดกลุ่มข้อมูลยอดขายตามสัปดาห์/เดือน
====================================================== */

function getGroupKey(dateString, mode) {
  const d = new Date(dateString + "T00:00:00");

  if (mode === "month") {
    return d.toLocaleDateString("th-TH", {
      month: "short",
      year: "numeric"
    });
  }

  return "สัปดาห์ " + getWeekNumber(dateString) + "/" + d.getFullYear();
}

function groupSales(mode) {
  const result = {};

  sales.forEach(item => {
    const key = getGroupKey(item.date, mode);
    result[key] = (result[key] || 0) + item.net;
  });

  return result;
}


/* ======================================================
   16) อัปเดต Dashboard และกราฟ
====================================================== */

function updateDashboard() {
  const totalBuy = buys.reduce((sum, item) => sum + item.amount, 0);
  const totalSale = sales.reduce((sum, item) => sum + item.net, 0);
  const profit = totalSale - totalBuy;

  document.getElementById("dashTotalBuy").innerText = money(totalBuy);
  document.getElementById("dashTotalSale").innerText = money(totalSale);
  document.getElementById("dashProfit").innerText = money(profit);
  document.getElementById("dashSaleCount").innerText = sales.length + " รายการ";

  const mode = document.getElementById("chartMode").value;
  const grouped = groupSales(mode);

  const labels = Object.keys(grouped);
  const values = Object.values(grouped);

  if (saleChart) saleChart.destroy();

  saleChart = new Chart(document.getElementById("saleChart"), {
    type: "bar",
    data: {
      labels: labels.length ? labels : ["ยังไม่มีข้อมูล"],
      datasets: [{
        label: "ยอดขายสุทธิ",
        data: values.length ? values : [0],
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  const onlineTotal = sales
    .filter(item => item.channel === "ขายออนไลน์")
    .reduce((sum, item) => sum + item.net, 0);

  const marketTotal = sales
    .filter(item => item.channel === "ขายตลาด")
    .reduce((sum, item) => sum + item.net, 0);

  if (channelChart) channelChart.destroy();

  channelChart = new Chart(document.getElementById("channelChart"), {
    type: "bar",
    data: {
      labels: ["ขายออนไลน์", "ขายตลาด"],
      datasets: [{
        label: "ยอดขายสุทธิ",
        data: [onlineTotal, marketTotal],
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}


/* ======================================================
   17) Export CSV
====================================================== */
/* ======================================================
   โหลดข้อมูลจาก Google Sheet กลับมาแสดงในเว็บ
   ใช้สำหรับเปิดเว็บจากมือถือหรือเครื่องใหม่
====================================================== */

async function loadFromGoogleSheet() {
  saveScriptUrl();

  if (!GOOGLE_SCRIPT_URL) {
    showStatus("settingStatus", "กรุณาใส่ URL Apps Script ก่อน", "error");
    return;
  }

  try {
    showStatus("settingStatus", "กำลังโหลดข้อมูลจาก Google Sheet...", "ok");

    const res = await fetch(GOOGLE_SCRIPT_URL);
    const json = await res.json();

    if (json.result !== "success") {
      showStatus("settingStatus", "โหลดข้อมูลไม่สำเร็จ", "error");
      return;
    }

    const sheetData = json.data || [];

    buys = [];
    sales = [];

    sheetData.forEach(row => {
      if (row.type === "ซื้อเข้า") {
        buys.push({
          id: Number(row.id) || Date.now(),
          date: formatSheetDate(row.date),
          product: row.product || "-",
          category: row.category || "อื่น ๆ",
          amount: Number(row.amount || 0),
          note: row.note || "",
          createdAt: row.createdAt || new Date().toISOString()
        });
      }

      if (row.type === "ขาย") {
        sales.push({
          id: Number(row.id) || Date.now(),
          date: formatSheetDate(row.date),
          channel: row.channel || "ขายออนไลน์",
          product: row.product || "-",
          amount: Number(row.amount || 0),
          fee: Number(row.fee || 0),
          net: Number(row.net || row.amount || 0),
          note: row.note || "",
          createdAt: row.createdAt || new Date().toISOString()
        });
      }
    });

    localStorage.setItem("toy_buys", JSON.stringify(buys));
    localStorage.setItem("toy_sales", JSON.stringify(sales));

    updateAll();

    showStatus("settingStatus", "โหลดข้อมูลจาก Google Sheet สำเร็จ", "ok");

  } catch (error) {
    console.error(error);
    showStatus("settingStatus", "โหลดข้อมูลไม่ได้ กรุณาตรวจ URL หรือ Deploy Apps Script ใหม่", "error");
  }
}


/* ======================================================
   แปลงวันที่จาก Google Sheet ให้กลับเป็น yyyy-mm-dd
====================================================== */

function formatSheetDate(value) {
  if (!value) return today;

  if (typeof value === "string") {
    if (value.includes("T")) {
      return value.split("T")[0];
    }
    return value;
  }

  const d = new Date(value);
  return d.toISOString().split("T")[0];
}
function exportCSV() {
  const rows = [
    ["id", "date", "type", "channel", "product", "category", "amount", "fee", "net", "note", "createdAt"]
  ];

  buys.forEach(item => {
    rows.push([
      item.id, item.date, "ซื้อเข้า", "-", item.product, item.category,
      item.amount, 0, item.amount, item.note, item.createdAt
    ]);
  });

  sales.forEach(item => {
    rows.push([
      item.id, item.date, "ขาย", item.channel, item.product, "-",
      item.amount, item.fee, item.net, item.note, item.createdAt
    ]);
  });

  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "toy-shop-money.csv";
  a.click();
}


/* ======================================================
   18) ล้างข้อมูล localStorage
====================================================== */

function clearLocalData() {
  if (!confirm("ต้องการล้างข้อมูลในเครื่องทั้งหมดใช่ไหม?")) return;

  localStorage.removeItem("toy_buys");
  localStorage.removeItem("toy_sales");

  buys = [];
  sales = [];

  updateAll();
}


/* ======================================================
   19) อัปเดตทุกส่วนของเว็บ
====================================================== */

function updateAll() {
  renderHistory();
  updateDashboard();
}


/* เริ่มต้นระบบ */
updateAll();
