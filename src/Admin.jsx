import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { db } from "./firebase";

const auth = getAuth();

const TYPE_META = {
  secure:       { label: "🌿 安定型", color: "#1D9E75", bg: "#E1F5EE", text: "#085041" },
  anxious:      { label: "🔥 不安型", color: "#7F77DD", bg: "#EEEDFE", text: "#26215C" },
  avoidant:     { label: "🧊 回避型", color: "#185FA5", bg: "#E6F1FB", text: "#042C53" },
  disorganized: { label: "⚡ 混合型", color: "#C4845A", bg: "#F5E6D8", text: "#5C2E0E" },
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    const diagSnap = await getDocs(collection(db, "diagnoses"));
    const visitSnap = await getDocs(collection(db, "visits"));
    
    const diagnoses = diagSnap.docs.map(d => d.data());
    const completions = diagnoses.filter(d => d.completed === true);
    const visits = visitSnap.size;
    
    const typeCounts = { secure: 0, anxious: 0, avoidant: 0, disorganized: 0 };
    completions.forEach(d => {
      if (d.resultType && typeCounts[d.resultType] !== undefined) {
        typeCounts[d.resultType]++;
      }
    });

    setStats({ visits, completions: completions.length, ctaClicks: 0, typeCounts });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("メールアドレスまたはパスワードが違います");
    }
  };

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FBFA" }}>
      <div style={{ background: "#fff", padding: "2rem", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", width: "320px" }}>
        <h2 style={{ textAlign: "center", color: "#1D9E75", marginBottom: "1.5rem" }}>管理画面ログイン</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
          />
          {error && <p style={{ color: "red", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>}
          <button type="submit" style={{ width: "100%", padding: "0.75rem", background: "#1D9E75", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            ログイン
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8FBFA", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ background: "#1D9E75", color: "#fff", padding: "1.5rem", borderRadius: "16px", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>ADMIN</div>
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>愛着タイプ診断 管理画面</h1>
          </div>
          <button onClick={() => signOut(auth)} style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer" }}>
            ログアウト
          </button>
        </div>

        {stats && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              {[
                { label: "訪問者(UU)数", value: stats.visits },
                { label: "診断完了数", value: stats.completions, sub: `完了率 ${stats.visits ? Math.round(stats.completions/stats.visits*100) : 0}%` },
                { label: "CTAクリック数", value: stats.ctaClicks },
                { label: "CTAクリック率", value: `${stats.completions ? Math.round(stats.ctaClicks/stats.completions*100) : 0}%`, sub: "完了者のうち", color: "#C4845A" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px" }}>
                  <div style={{ color: "#666", fontSize: "0.85rem" }}>{label}</div>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: color || "#333" }}>{value}</div>
                  {sub && <div style={{ color: "#999", fontSize: "0.8rem" }}>{sub}</div>}
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", marginBottom: "1rem" }}>
              <h3 style={{ margin: "0 0 1rem" }}>タイプ別 診断結果</h3>
              {Object.entries(TYPE_META).map(([key, meta]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ width: "80px", fontSize: "0.85rem", color: meta.text }}>{meta.label}</span>
                  <div style={{ flex: 1, background: "#f0f0f0", borderRadius: "4px", height: "8px", margin: "0 1rem" }}>
                    <div style={{ width: `${stats.completions ? stats.typeCounts[key]/stats.completions*100 : 0}%`, background: meta.color, height: "8px", borderRadius: "4px" }} />
                  </div>
                  <span style={{ fontSize: "0.85rem", color: "#666" }}>{stats.typeCounts[key]}人 ({stats.completions ? Math.round(stats.typeCounts[key]/stats.completions*100) : 0}%)</span>
                </div>
              ))}
            </div>

            <button onClick={fetchStats} style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: "8px", padding: "0.75rem 1.5rem", cursor: "pointer", fontWeight: "bold" }}>
              🔄 更新
            </button>
          </>
        )}
      </div>
    </div>
  );
}
