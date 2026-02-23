import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, AlertTriangle, Layers, AlignLeft, CheckCircle, Tag } from 'lucide-react';

export default function ControlDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [control, setControl] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Fetch both the index (for relations) and the specific control
        Promise.all([
            fetch('/controls/index.json').then(r => r.json()),
            fetch(`/controls/${id}.json`).then(r => r.json())
        ])
            .then(([indexData, controlData]) => {
                setData(indexData);
                setControl(controlData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading JSON:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading control...</div>;
    if (!control) return <div style={{ textAlign: 'center', padding: '4rem' }}>Control not found</div>;

    const ai = control.AI_Processed;
    const meta = control.Metadata;
    const isError = control.ProcessingError;
    const isUnclear = ai?.IsUnclear;

    // Use Intl.Segmenter for Thai text word tokenization to find related keywords
    const getKeywords = (c, isDetail = false) => {
        let text = '';
        if (isDetail) {
            text = `${c.OriginalTopic} ${c.AI_Processed?.Topic || ''} ${c.AI_Processed?.Recommendations?.join(' ') || ''} ${c.OriginalRecommendations}`.toLowerCase();
        } else {
            text = `${c.OriginalTopic} ${c.AI_Topic || ''} ${c.AI_Recommendations?.join(' ') || ''}`.toLowerCase();
        }

        try {
            const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
            const segments = segmenter.segment(text);
            const words = new Set();
            for (const { segment, isWordLike } of segments) {
                // Filter out very short generic words, keep meaningful ones
                if (isWordLike && segment.length > 2) {
                    words.add(segment);
                }
            }
            return words;
        } catch (e) {
            // Fallback for browsers that don't support Intl.Segmenter
            return new Set(text.match(/[ก-๙a-zA-Z0-9]+/g) || []);
        }
    };

    // Calculate related controls using keyword intersection
    const targetKeywords = getKeywords(control, true);

    const scoredControls = data
        .filter(c => c.ControlID !== id && !c.ProcessingError)
        .map(c => {
            const cKeywords = getKeywords(c, false);
            let score = 0;
            for (const w of targetKeywords) {
                if (cKeywords.has(w)) score++;
            }
            return { ...c, simScore: score };
        });

    // Sort by highest score, take top 3
    const related = scoredControls.sort((a, b) => b.simScore - a.simScore).slice(0, 3);

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', maxWidth: '900px', margin: '0 auto' }}>

            <button
                onClick={() => navigate('/')}
                className="nav-link"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginBottom: '1.5rem', fontSize: '1rem' }}
            >
                <ArrowLeft size={18} />
                Back to Dashboard
            </button>

            <div className="detail-header">
                <span className="badge mandatory" style={{ marginBottom: '1rem' }}>{control.ControlID}</span>
                <h1 className="detail-title">{ai?.Topic || control.OriginalTopic}</h1>
                <p style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={18} />
                    {control.Category.replace(/^[0-9\.\s]+/, '')} {/* Strip leading numbers for cleaner UI */}
                </p>
            </div>

            <div className="meta-grid">
                <div className="meta-item">
                    <div className="meta-label">Application Type</div>
                    <div className="meta-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Tag size={16} /> {meta.ApplicationType}
                    </div>
                </div>
                <div className="meta-item">
                    <div className="meta-label">Service Type</div>
                    <div className="meta-value">{meta.ServiceType}</div>
                </div>
                <div className="meta-item">
                    <div className="meta-label">Compliance Status</div>
                    <div className="meta-value" style={{ color: meta.Compliance === 'Mandatory' ? 'var(--status-mandatory)' : 'var(--status-optional)' }}>
                        {meta.Compliance}
                    </div>
                </div>
                <div className="meta-item">
                    <div className="meta-label">Impact Levels (L / M / H)</div>
                    <div className="meta-value">
                        {meta.ImpactLevels.Low} / {meta.ImpactLevels.Medium} / <span style={{ color: meta.ImpactLevels.High === 'Mandatory' ? 'var(--status-mandatory)' : 'inherit' }}>{meta.ImpactLevels.High}</span>
                    </div>
                </div>
            </div>

            {isError ? (
                <div style={{ color: 'var(--status-mandatory)', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
                    <AlertTriangle size={20} style={{ display: 'inline', marginRight: '8px' }} />
                    Error processing this control. Data missing.
                </div>
            ) : isUnclear ? (
                <div className="content-section">
                    <div style={{ color: 'var(--status-high)', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                        <strong>หมายเหตุจาก AI:</strong> {ai.UnclearReason || 'ข้อมูลต้นฉบับไม่ชัดเจน'}
                    </div>
                    <h3><AlignLeft size={20} /> ข้อแนะนำในการปฏิบัติ (ข้อมูลเดิม)</h3>
                    <p style={{ background: 'rgba(0,0,0,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                        {control.OriginalRecommendations}
                    </p>
                </div>
            ) : (
                <>
                    <div className="content-section">
                        <h3><AlignLeft size={20} /> ข้อแนะนำในการปฏิบัติ (Recommendations)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {ai?.Recommendations?.map((rec, i) => (
                                <p key={i}>{rec}</p>
                            ))}
                        </div>
                    </div>

                    <div className="content-section" style={{ background: 'linear-gradient(to right, rgba(248, 250, 252, 0.8), transparent)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                        <h3><CheckCircle size={20} /> รายการตรวจสอบ (Checklist)</h3>
                        <ul className="content-list">
                            {ai?.Checklist?.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="content-section">
                        <h3><ExternalLink size={20} /> หลักฐาน (Evidence)</h3>
                        <ul className="content-list" style={{ padding: '0 2rem' }}>
                            {ai?.Evidence?.map((ev, i) => (
                                <li key={i} style={{ color: 'var(--text-muted)' }}>{ev}</li>
                            ))}
                        </ul>
                    </div>

                    {ai?.SuggestedCorrections && ai.SuggestedCorrections.length > 0 && (
                        <div className="suggestion-box">
                            <h3 style={{ color: 'var(--status-low)', fontSize: '1rem', marginBottom: '0.75rem' }}>✨ ข้อเสนอแนะส่วนตัวจาก AI (Metadata Adjustments)</h3>
                            <ul style={{ paddingLeft: '1.5rem', margin: 0, fontStyle: 'italic', color: 'rgba(139, 92, 246, 0.9)' }}>
                                {ai.SuggestedCorrections.map((sg, i) => (
                                    <li key={i} style={{ marginBottom: '0.4rem' }}>{sg}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}

            {/* Related Controls Section */}
            {related.length > 0 && (
                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Related Controls (Similar Keywords)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                        {related.map(r => (
                            <Link to={`/control/${r.ControlID}`} key={r.ControlID} style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
                                <div className="glass-panel" style={{ padding: '1rem', cursor: 'pointer', height: '100%', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span className="badge mandatory" style={{ fontSize: '0.65rem' }}>{r.ControlID}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.simScore} matching words</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem' }}>{r.AI_Topic || r.OriginalTopic || 'Untitled'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: 'auto' }}>
                                        {r.Category.replace(/^[0-9\.\s]+/, '')}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
