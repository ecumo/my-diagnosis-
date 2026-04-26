import { useState, useEffect } from "react";

import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// ============================================================
// Firebase設定
// ============================================================

// ============================================================
// カラー定数
// ============================================================
const TYPE_META = {
  secure:       { label: "🌿 安定型", color: "#1D9E75", bg: "#E1F5EE", text: "#085041" },
  anxious:      { label: "🔥 不安型", color: "#7F77DD", bg: "#EEEDFE", text: "#26215C" },
  avoidant:     { label: "🧊 回避型", color: "#185FA5", bg: "#E6F1FB", text: "#042C53" },
  disorganized: { label: "⚡ 混合型", color: "#C4845A", bg: "#F5E6D8", text: "#5C2E0E" },
};

// ============================================================
// スタイル
// ============================================================
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans JP', system-ui, sans-serif; background: #F4F6F5; }
  .admin { max-width: 960px; margin: 0 auto; padding: 24px 16px 60px; }
  .header { background: #4A7B6F; color: #fff; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
  .refresh-btn { background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.4); border-radius: 8px; padding: 6px 14px; font-size: 13px; cursor: pointer; font-family: inherit; }
  .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
  .kpi-card { background: #fff; border-radius: 14px; border: 1px solid #E0EDE9; padding: 20px; }
  .kpi-label { font-size: 12px; color: #888; margin-bottom: 8px; }
  .kpi-value { font-size: 32px; font-weight: 700; color: #1a1a1a; line-height: 1; }
  .kpi-sub { font-size: 12px; color: #aaa; margin-top: 6px; }
  .card { background: #fff; border-radius: 14px; border: 1px solid #E0EDE9; padding: 20px; margin-bottom: 16px; }
  .section-title { font-size: 13px; font-weight: 700; color: #888; margin-bottom: 14px; letter-spacing: 0.05em; }
  .type-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .type-label { font-size: 13px; font-weight: 500; min-width: 80px; }
  .bar-wrap { flex: 1; height: 10px; background: #f0f0f0; border-radius: 99px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
  .type-pct { font-size: 13px; color: #888; min-width: 40px; text-align: right; }
  .loading { text-align: center; padding: 60px; color: #888; font-size: 15px; }
  .cta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .cta-item { background: #f8f8f6; border-radius: 10px; padding: 14px; }
  .cta-pct { font-size: 24px; font-weight: 700; margin-top: 4px; }
  .cta-sub { font-size: 11px; color: #bbb; margin-top: 2px; }
`;

function pct(a, b) { return b === 0 ? "0" : Math.round((a / b) * 100); }

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [visitsSnap, diagnosesSnap, ctaSnap] = await Promise.all([
        getDocs(collection(db, "visits")),
        getDocs(collection(db, "diagnoses")),
        getDocs(collection(db, "ctaClicks")),
      ]);
      const visits = visitsSnap.docs.map(d => d.data());
      const diagnoses = diagnosesSnap.docs.map(d => d.data());
      const ctas = ctaSnap.docs.map(d => d.data());
      setData({ visits, diagnoses, ctas });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <>
      <style>{css}</style>
      <div className="admin">
        <div className="loading">📊 データを読み込み中...</div>
      </div>
    </>
  );

  const { visits, diagnoses, ctas } = data;
  const visitCount = visits.length;
  const completeCount = diagnoses.length;
  const ctaCount = ctas.length;
  const completeRate = pct(completeCount, visitCount);
  const ctaRate = pct(ctaCount, completeCount);

  const typeCounts = { secure: 0, anxious: 0, avoidant: 0, disorganized: 0 };
  diagnoses.forEach(d => { if (typeCounts[d.resultType] !== undefined) typeCounts[d.resultType]++; });
  const typeCtaCounts = { secure: 0, anxious: 0, avoidant: 0, disorganized: 0 };
  ctas.forEach(c => { if (typeCtaCounts[c.resultType] !== undefined) typeCtaCounts[c.resultType]++; });

  return (
    <>
      <style>{css}</style>
      <div className="admin">
        {/* ヘッダー */}
        <div className="header">
          <div>
            <p style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>ADMIN</p>
            <h1 style={{ fontSize: 18, fontWeight: 700 }}>愛着タイプ診断 管理画面</h1>
          </div>
          <button className="refresh-btn" onClick={loadData}>↻ 更新</button>
        </div>

        {/* KPI */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">訪問者数</div>
            <div className="kpi-value">{visitCount}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">診断完了数</div>
            <div className="kpi-value">{completeCount}</div>
            <div className="kpi-sub">完了率 {completeRate}%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">CTAクリック数</div>
            <div className="kpi-value">{ctaCount}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">CTAクリック率</div>
            <div className="kpi-value" style={{ color: ctaRate >= 30 ? "#1D9E75" : "#C4845A" }}>{ctaRate}%</div>
            <div className="kpi-sub">完了者のうち</div>
          </div>
        </div>

        {/* タイプ別割合 */}
        <div className="card">
          <p className="section-title">タイプ別 診断結果</p>
          {Object.entries(typeCounts).sort((a,b) => b[1]-a[1]).map(([type, count]) => {
            const meta = TYPE_META[type];
            return (
              <div key={type} className="type-row">
                <span className="type-label" style={{ color: meta.text }}>{meta.label}</span>
                <div className="bar-wrap">
                  <div className="bar-fill" style={{ width: `${pct(count, completeCount)}%`, background: meta.color }} />
                </div>
                <span className="type-pct">{count}人 ({pct(count, completeCount)}%)</span>
              </div>
            );
          })}
        </div>

        {/* タイプ別CTAクリック率 */}
        <div className="card">
          <p className="section-title">タイプ別 CTAクリック率</p>
          <div className="cta-grid">
            {Object.entries(TYPE_META).map(([type, meta]) => {
              const total = typeCounts[type];
              const clicked = typeCtaCounts[type];
              return (
                <div key={type} className="cta-item">
                  <p style={{ fontSize: 12, color: "#888" }}>{meta.label}</p>
                  <p className="cta-pct" style={{ color: meta.color }}>{pct(clicked, total)}%</p>
                  <p className="cta-sub">{clicked} / {total}人</p>
                </div>
              );
            })}
          </div>
        </div>

        <p style={{ fontSize: 12, color: "#aaa", textAlign: "center" }}>
          最終更新: {new Date().toLocaleString("ja-JP")}
        </p>
      </div>
    </>
  );
}
