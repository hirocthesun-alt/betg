import React, { useState, useEffect, useRef } from "react";

const Button = ({ children, className = "", ...props }) => (
  <button {...props} className={`rounded px-3 py-2 text-sm ${className}`}>
    {children}
  </button>
);

function Dashboard() {
  const [timer, setTimer] = useState(30);
  const [balance, setBalance] = useState(() => {
  const saved = localStorage.getItem("balance");
  return saved ? JSON.parse(saved) : 1000;
});
  const [history, setHistory] = useState(() => {
  const saved = localStorage.getItem("round_history");
  return saved ? JSON.parse(saved) : [];
});
  const [betHistory, setBetHistory] = useState(() => {
  const saved = localStorage.getItem("bet_history");
  return saved ? JSON.parse(saved) : [];
});
  const [betChoice, setBetChoice] = useState(null);
  const [result, setResult] = useState("");
  const [showBetPanel, setShowBetPanel] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [amount, setAmount] = useState("");

  const accountRef = useRef(null);

  // Persist data
  useEffect(() => {
    localStorage.setItem("round_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("bet_history", JSON.stringify(betHistory));
  }, [betHistory]);

  useEffect(() => {
    localStorage.setItem("balance", JSON.stringify(balance));
  }, [balance]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t === 0) {
          const outcome = Math.random() < 0.5 ? "ODD" : "EVEN";

          if (betChoice) {
            const win = betChoice === outcome;
            const amount = win ? 200 : -100;

            setBalance((b) => b + amount);

            setBetHistory((prev) => [
              {
                choice: betChoice,
                outcome,
                amount,
                status: win ? "WON" : "LOST",
                time: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }),
              },
              ...prev,
            ]);

            setResult(win ? "You WON!" : "You LOST!");
          }

          setHistory((prev) => [
            { outcome, time: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }) },
            ...prev,
          ]);

          setBetChoice(null);
          return 30;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [betChoice]);

  const handleTransaction = () => {
    const val = parseInt(amount);
    if (!val) return;

    if (actionType === "deposit") {
      setBalance((b) => b + val);
    }

    if (actionType === "withdraw") {
      if (val > balance) return setResult("Insufficient balance");
      setBalance((b) => b - val);
    }

    setShowModal(false);
    setAmount("");
  };

  const placeBet = (type) => {
    if (timer <= 10) return setResult("Bet closed");
    if (betChoice) return setResult("Already placed");
    if (balance < 100) return setResult("Low balance");

    setBalance((b) => b - 100);
    setBetChoice(type);
    setResult(`Bet on ${type}`);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-600 p-4 text-white">

      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-700 p-2 rounded-lg mb-2 flex justify-end items-center gap-1">
        <div className="bg-green-600 px-2 py-[2px] rounded text-[11px] font-bold">
          KES {balance}
        </div>

        <div className="relative">
          <button onClick={() => setShowAccountMenu(p => !p)} className="text-lg">☰</button>

          {showAccountMenu && (
            <div className="absolute right-0 mt-2 bg-white text-black rounded shadow p-2 flex flex-col gap-1">
              <button
                onClick={() => { setActionType("deposit"); setShowModal(true); }}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
              >
                Deposit
              </button>
              <button
                onClick={() => { setActionType("withdraw"); setShowModal(true); }}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded"
              >
                Withdraw
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-black p-4 rounded-lg w-[250px]">
            <div className="font-bold mb-2 text-center">
              {actionType === "deposit" ? "Enter Deposit Amount" : "Enter Withdraw Amount"}
            </div>

            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Enter amount"
              className="border p-2 rounded w-full mb-3"
            />

            <div className="flex gap-2">
              <Button onClick={handleTransaction} className="flex-1 bg-green-600 text-white">
                Confirm
              </Button>
              <Button onClick={() => setShowModal(false)} className="flex-1 bg-gray-300">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Timer */}
      <div className="text-center mb-3">
        <div className="font-bold">
          {timer > 10 ? (
            <span className="text-green-400">Bet Now</span>
          ) : (
            <span className="text-orange-400">Waiting results...</span>
          )}
        </div>
        <div>{timer}s</div>

        <div className="w-full h-2 bg-gray-300 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${timer > 10 ? "bg-green-500" : "bg-orange-400"}`}
            style={{ width: (timer / 30) * 100 + "%" }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mb-3">
        <Button
          onClick={() => placeBet("ODD")}
          className={`flex-1 text-white font-bold text-lg ${betChoice === "ODD" ? "bg-orange-500 scale-95" : "bg-green-600"}`}
        >
          ODD
        </Button>
        <Button
          onClick={() => placeBet("EVEN")}
          className={`flex-1 text-white font-bold text-lg ${betChoice === "EVEN" ? "bg-orange-500 scale-95" : "bg-green-600"}`}
        >
          EVEN
        </Button>
      </div>

      <div className="text-center mb-3">{result}</div>

      {/* Round History */}
      <div className="bg-white text-black rounded p-2 relative">
        <div className="flex justify-between items-center mb-1">
          <div className="font-bold">Round History</div>
          <button onClick={() => setShowBetPanel(p => !p)}>☰</button>
        </div>

        <div className="max-h-[200px] overflow-y-auto">
          {history.map((h, i) => (
            <div key={i} className="border-b py-1 text-[10px]">
              <div className={h.outcome === "ODD" ? "text-orange-500 font-bold" : "text-purple-600 font-bold"}>
                {h.outcome}
              </div>
              <div className="text-[9px] text-gray-500">{h.time}</div>
            </div>
          ))}
        </div>

        {showBetPanel && (
          <div className="absolute top-0 right-0 w-[60%] h-full bg-cyan-100 rounded shadow-lg overflow-y-auto">
            <div className="sticky top-0 bg-cyan-200 p-1 flex justify-between items-center">
              <span className="font-bold text-xs">My Bet History</span>
              <button onClick={() => setShowBetPanel(false)}>✖</button>
            </div>

            {betHistory.map((b, i) => (
              <div key={i} className="border-b py-[2px] px-1 text-[10px]">
                <div>{b.choice} → {b.outcome}</div>
                <div className={b.amount > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {b.amount > 0 ? `+KES ${b.amount}` : `KES ${b.amount}`}
                </div>
                <div className="text-[9px] text-gray-500">{b.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  if (mode === "dashboard") return <Dashboard />;

  return (
    <div className="flex items-center justify-center h-screen bg-slate-600">
      <div className="bg-white p-6 rounded-xl shadow w-[280px] text-center">
        <h2 className="text-lg font-bold mb-4">
          {mode === "login" ? "Login" : "Create Account"}
        </h2>

        {step === 1 && (
          <>
            <input
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border p-2 rounded w-full mb-3"
            />

            <Button
              onClick={() => {
                if (!phone) return;
                setStep(2);
              }}
              className="w-full bg-blue-500 text-white mb-2"
            >
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              placeholder="Enter 6-digit password"
              maxLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, ""))}
              className="border p-2 rounded w-full mb-3 text-center tracking-widest"
            />

            <Button
              onClick={() => {
                if (password.length !== 6) return;
                setMode("dashboard");
              }}
              className="w-full bg-green-600 text-white mb-2"
            >
              {mode === "login" ? "Login" : "Sign Up"}
            </Button>

            <p className="text-xs text-blue-500 cursor-pointer" onClick={() => setStep(1)}>
              ← Back
            </p>
          </>
        )}

        {mode === "login" ? (
          <p className="text-xs mt-2">
            No account?{" "}
            <span onClick={() => { setMode("signup"); setStep(1); }} className="text-blue-500 cursor-pointer">
              Sign Up
            </span>
          </p>
        ) : (
          <p className="text-xs mt-2">
            Already have account?{" "}
            <span onClick={() => { setMode("login"); setStep(1); }} className="text-blue-500 cursor-pointer">
              Login
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
