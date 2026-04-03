# 💰 Zorvyn Pay – Financial Health Dashboard

A modern, responsive personal finance dashboard built using **React**, **Tailwind CSS**, and **Framer Motion**. This application helps users track transactions, analyze spending patterns, and gain insights through an intuitive interface.

---

## 📘 Assignment Context

This project was developed as part of the **Zorvyn Frontend Developer Internship assignment**.

| Objective          | Description                            |
| ------------------ | -------------------------------------- |
| UI/UX Design       | Create a clean and intuitive dashboard |
| Component Design   | Structure reusable frontend components |
| State Management   | Handle data and UI states efficiently  |
| Data Visualization | Represent financial data clearly       |

---

## 🌐 Live Demo

👉 https://zorvyn-pay.vercel.app/

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version       |
| ----------- | ------------- |
| Node.js     | v16 or higher |
| npm / yarn  | Latest        |

### Installation

```bash
git clone https://github.com/your-username/zorvyn-pay.git
cd zorvyn-pay
npm install
npm run dev
```

---

## 🛠 Tech Stack

| Category   | Tools Used    |
| ---------- | ------------- |
| Framework  | React         |
| Build Tool | Vite          |
| Styling    | Tailwind CSS  |
| Charts     | Recharts      |
| Animation  | Framer Motion |
| Icons      | Lucide React  |

---

## ✨ Features

### 📊 Dashboard Overview

| Feature        | Description                      |
| -------------- | -------------------------------- |
| Summary Cards  | Net Balance, Income, Expenses    |
| Trend Chart    | Area chart for balance over time |
| Category Chart | Pie chart for expense breakdown  |

### 📋 Transactions

| Feature      | Description                  |
| ------------ | ---------------------------- |
| Data Display | Date, Amount, Category, Type |
| Search       | Filter by merchant           |
| Filter       | Income / Expense             |
| Sorting      | Date / Amount                |
| Grouping     | Category-based grouping      |

### 👤 Role-Based UI

| Role   | Permissions       |
| ------ | ----------------- |
| Admin  | Add, Edit, Delete |
| Viewer | Read-only         |

---

## 📈 Insights

| Insight            | Description                      |
| ------------------ | -------------------------------- |
| Highest Category   | Detects top spending category    |
| Expense Comparison | Shows % difference from baseline |

---

## 🎨 UI/UX Enhancements

| Feature           | Description                        |
| ----------------- | ---------------------------------- |
| Responsive Design | Works on mobile & desktop          |
| Dark Mode         | Toggle between themes              |
| Animations        | Smooth transitions (Framer Motion) |
| Empty States      | Handles no-data cases              |

---

## ⚙️ Additional Features

| Feature       | Description           |
| ------------- | --------------------- |
| Local Storage | Saves data in browser |
| Export        | CSV / JSON download   |
| View Modes    | List & Grouped view   |

---

## 🧠 Approach

| Aspect            | Implementation                                                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture      | Single Page Application (SPA)                                                                                                                 |
| State Management  | useState, useMemo, useEffect                                                                                                                  |
| Data Optimization | Leveraged `useMemo` for financial calculations (totals, filtering, grouping) to avoid unnecessary re-renders and ensure smooth UI performance |
| Performance       | Memoized heavy computations for efficient updates                                                                                             |
| UI Design         | Clean, minimal, and user-friendly layout                                                                                                      |

---

## 📁 Project Structure

| Component          | Purpose               |
| ------------------ | --------------------- |
| App.js             | Main logic & layout   |
| Card               | Summary UI            |
| TransactionModal   | Add/Edit form         |
| DeleteConfirmModal | Delete confirmation   |
| SidebarContent     | Navigation & controls |

> Note: Components are kept in a single file for simplicity.

---

## ⚠️ Assumptions

| Area    | Details                  |
| ------- | ------------------------ |
| Data    | Mock data used           |
| Backend | Not implemented          |
| Roles   | Simulated frontend logic |

---

## 👩‍💻 Author

**Janice Benita**

