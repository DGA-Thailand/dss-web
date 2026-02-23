import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';

export default function Home() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/controls/index.json')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => console.error("Error loading JSON:", err));
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading standards...</div>;
    }
    // Group by Category
    const grouped = data.reduce((acc, control) => {
        const cat = control.Category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(control);
        return acc;
    }, {});

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: 'var(--glass-border)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Categories Overview</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {Object.keys(grouped).map((cat, idx) => (
                        <a href={`#category-${idx}`} key={idx} className="badge" style={{ padding: '0.5rem 1rem', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.85rem' }}>
                            {cat.replace(/^[0-9\.\s]+/, '')} ({grouped[cat].length})
                        </a>
                    ))}
                </div>
            </div>

            {Object.entries(grouped).map(([category, controls], idx) => (
                <div key={idx} id={`category-${idx}`} style={{ marginBottom: '4rem', scrollMarginTop: '2rem' }}>
                    <h2 className="section-title">
                        <FileText size={24} style={{ color: 'var(--color-primary)' }} />
                        {category}
                    </h2>

                    <div className="grid-listing">
                        {controls.map(control => {
                            const topic = control.AI_Topic || control.OriginalTopic || 'Untitled Control';
                            const impact = control.ImpactLevels?.High === 'Mandatory' ? 'High Impact' : 'Standard';

                            return (
                                <Link to={`/control/${control.ControlID}`} key={control.ControlID} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="glass-panel card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <span className="badge mandatory">{control.ControlID}</span>
                                            <span className="badge" style={{ background: 'rgba(0,0,0,0.05)' }}>{control.ApplicationType}</span>
                                        </div>

                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', flex: 1 }}>{topic}</h3>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{impact}</span>
                                            <ArrowRight size={18} color="var(--color-primary)" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
