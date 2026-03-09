import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Search, Filter } from 'lucide-react';

const MAIN_CATEGORIES = {
    'PS': 'Principle and Strategy',
    'AI': 'Appearance and Identity',
    'AP': 'Availability and Performance',
    'FT': 'Function and Transaction',
    'TC': 'Technical Integration',
    'SP': 'Security and Privacy',
    'RS': 'Review and Assessment'
};

export default function Home() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedServiceType, setSelectedServiceType] = useState('ALL');
    const [selectedCompliance, setSelectedCompliance] = useState('ALL');
    const [selectedImpact, setSelectedImpact] = useState('ALL');
    const [selectedMainCategory, setSelectedMainCategory] = useState('ALL');

    useEffect(() => {
        fetch('/controls/index.json')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => console.error("Error loading JSON:", err));
    }, []);

    const { serviceTypes, compliances } = useMemo(() => {
        const sTypes = new Set();
        const cTypes = new Set();
        data.forEach(d => {
            if (d.ServiceType && d.ServiceType !== '-') sTypes.add(d.ServiceType);
            if (d.Compliance && d.Compliance !== '-') cTypes.add(d.Compliance);
        });
        return {
            serviceTypes: Array.from(sTypes).sort(),
            compliances: Array.from(cTypes).sort()
        };
    }, [data]);

    const filteredData = useMemo(() => {
        return data.filter(control => {
            const topic = (control.AI_Topic || control.OriginalTopic || '').toLowerCase();
            const controlId = (control.ControlID || '').toLowerCase();
            const st = searchTerm.toLowerCase();

            const prefix = (control.ControlID || '').substring(0, 2).toUpperCase();

            const matchesSearch = !st || topic.includes(st) || controlId.includes(st);
            const matchesService = selectedServiceType === 'ALL' || control.ServiceType === selectedServiceType || (selectedServiceType === 'Other' && (!control.ServiceType || control.ServiceType === '-'));
            const matchesCompliance = selectedCompliance === 'ALL' || control.Compliance === selectedCompliance || (selectedCompliance === 'Other' && (!control.Compliance || control.Compliance === '-'));
            const matchesMainCategory = selectedMainCategory === 'ALL' || prefix === selectedMainCategory;

            let matchesImpact = true;
            if (selectedImpact !== 'ALL') {
                const levels = control.ImpactLevels || {};
                matchesImpact = Object.values(levels).includes(selectedImpact);
            }

            return matchesSearch && matchesService && matchesCompliance && matchesImpact && matchesMainCategory;
        });
    }, [data, searchTerm, selectedServiceType, selectedCompliance, selectedImpact, selectedMainCategory]);

    // Group by Main Category using prefix
    const grouped = filteredData.reduce((acc, control) => {
        const prefix = (control.ControlID || '').substring(0, 2).toUpperCase();
        const catName = MAIN_CATEGORIES[prefix]
            ? `${prefix} = ${MAIN_CATEGORIES[prefix]}`
            : 'Other / Uncategorized';

        if (!acc[catName]) acc[catName] = [];
        acc[catName].push(control);
        return acc;
    }, {});

    // Sort the groups based on the defined order in MAIN_CATEGORIES
    const sortedGroupKeys = Object.keys(grouped).sort((a, b) => {
        if (a === 'Other / Uncategorized') return 1;
        if (b === 'Other / Uncategorized') return -1;
        const prefixA = a.substring(0, 2);
        const prefixB = b.substring(0, 2);
        const orderA = Object.keys(MAIN_CATEGORIES).indexOf(prefixA);
        const orderB = Object.keys(MAIN_CATEGORIES).indexOf(prefixB);
        return orderA - orderB;
    });

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading standards...</div>;
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem', padding: '2rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: 'var(--glass-border)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ flex: '1 1 300px', position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by ID or keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-main)', fontSize: '1rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={18} color="var(--color-primary)" />
                            <select value={selectedMainCategory} onChange={(e) => setSelectedMainCategory(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-main)' }}>
                                <option value="ALL">All Categories</option>
                                {Object.entries(MAIN_CATEGORIES).map(([prefix, name]) => (
                                    <option key={prefix} value={prefix}>{prefix} = {name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <select value={selectedServiceType} onChange={(e) => setSelectedServiceType(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-main)' }}>
                                <option value="ALL">All Service Types</option>
                                {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <select value={selectedCompliance} onChange={(e) => setSelectedCompliance(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-main)' }}>
                                <option value="ALL">All Compliance</option>
                                {compliances.map(c => <option key={c} value={c}>{c}</option>)}
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <select value={selectedImpact} onChange={(e) => setSelectedImpact(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-main)' }}>
                                <option value="ALL">All Impact Levels</option>
                                <option value="Mandatory">Mandatory</option>
                                <option value="Optional">Optional</option>
                            </select>
                        </div>
                    </div>
                </div>

                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Categories Overview</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {sortedGroupKeys.map((cat, idx) => (
                        <a href={`#category-${idx}`} key={idx} className="badge" style={{ padding: '0.5rem 1rem', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.85rem' }}>
                            {cat} ({grouped[cat].length})
                        </a>
                    ))}
                    {sortedGroupKeys.length === 0 && (
                        <span style={{ color: 'var(--text-muted)' }}>No controls match your filters.</span>
                    )}
                </div>
            </div>

            {sortedGroupKeys.map((category, idx) => (
                <div key={idx} id={`category-${idx}`} style={{ marginBottom: '4rem', scrollMarginTop: '2rem' }}>
                    <h2 className="section-title">
                        <FileText size={24} style={{ color: 'var(--color-primary)' }} />
                        {category}
                    </h2>

                    <div className="grid-listing">
                        {grouped[category].map(control => {
                            const topic = control.AI_Topic || control.OriginalTopic || 'Untitled Control';

                            return (
                                <Link to={`/control/${control.ControlID}`} key={control.ControlID} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="glass-panel card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <span className="badge mandatory">{control.ControlID}</span>
                                            <span className="badge" style={{ background: 'rgba(0,0,0,0.05)' }}>{control.ApplicationType}</span>
                                        </div>

                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', flex: 1 }}>{topic}</h3>

                                        <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{control.ServiceType !== '-' ? control.ServiceType : 'Any Service'} | {control.Compliance !== '-' ? control.Compliance : 'Any Compliance'}</span>
                                                <ArrowRight size={18} color="var(--color-primary)" />
                                            </div>
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
