import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function FinanceApp() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [transactions, setTransactions] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("transactions");
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (e) => {
    e.preventDefault();
    if (!amount || !category || !date) return;

    const numericAmount = Number(amount);

    const newTransaction = {
      id: Date.now(),
      amount: numericAmount,
      category,
      date,
      type: numericAmount >= 0 ? "income" : "expense",
    };

    setTransactions((prev) => [...prev, newTransaction]);

    setAmount("");
    setCategory("");
    setDate("");
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const startEditing = (tx) => {
    setEditingId(tx.id);
    setEditingValue(tx.amount);
  };

  const saveEdit = (id) => {
    const numericAmount = Number(editingValue);

    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === id
          ? {
              ...tx,
              amount: numericAmount,
              type: numericAmount >= 0 ? "income" : "expense",
            }
          : tx
      )
    );

    setEditingId(null);
    setEditingValue("");
  };

  const totalBalance = transactions.reduce((acc, cur) => acc + cur.amount, 0);

  // 🔥 카테고리별 합계 → 차트 데이터
  const chartData = Object.entries(
    transactions.reduce((acc, cur) => {
      if (!acc[cur.category]) acc[cur.category] = 0;
      acc[cur.category] += Math.abs(cur.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💰 Personal Finance App</h1>

      {/* 잔액 */}
      <div className="bg-gray-100 p-4 rounded-2xl mb-6 shadow">
        <h2 className="text-lg">Total Balance</h2>
        <p className="text-2xl font-semibold">
          {totalBalance.toLocaleString()} 원
        </p>
      </div>

      {/* 입력 */}
      <form onSubmit={addTransaction} className="bg-white p-4 rounded-2xl shadow mb-6">
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            placeholder="금액 (지출은 - 입력)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="카테고리"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button type="submit" className="mt-3 w-full bg-black text-white p-2 rounded-xl">
          추가
        </button>
      </form>

      {/* 🔥 도넛 차트 */}
      <div className="bg-white p-4 rounded-2xl shadow mb-6 flex justify-center">
        {chartData.length === 0 ? (
          <p className="text-gray-400">차트 데이터 없음</p>
        ) : (
          <PieChart width={300} height={300}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </div>

      {/* 테이블 */}
      <div className="bg-white p-4 rounded-2xl shadow">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-400">거래 내역이 없습니다</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">날짜</th>
                <th className="p-2">카테고리</th>
                <th className="p-2">금액</th>
                <th className="p-2">삭제</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b">
                  <td className="p-2">{tx.date}</td>
                  <td className="p-2">{tx.category}</td>

                  <td
                    className={`p-2 font-semibold ${
                      tx.type === "income" ? "text-blue-500" : "text-red-500"
                    }`}
                    onDoubleClick={() => startEditing(tx)}
                  >
                    {editingId === tx.id ? (
                      <input
                        type="number"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => saveEdit(tx.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(tx.id);
                        }}
                        autoFocus
                        className="border p-1 rounded w-24"
                      />
                    ) : (
                      <>
                        {tx.type === "income" ? "+" : ""}
                        {tx.amount.toLocaleString()} 원
                      </>
                    )}
                  </td>

                  <td className="p-2">
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="text-sm text-white bg-red-500 px-2 py-1 rounded"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
