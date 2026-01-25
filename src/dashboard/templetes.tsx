import { Zap, Layout, ImageIcon, Star, ArrowRight, Plus } from 'lucide-react';

export const TEMPLATES = {
    agency: { 
      label: 'Creative Agency', 
      icon: <Zap size={22} />,
      description: 'A complete multi-section experience for high-end studios.',
      sections: [
        { type: 'hero_comercial', content: { title: 'We Build Digital Gold', sub: 'An award-winning design agency crafting digital experiences that matter.' }, style: { theme: 'dark', align: 'left', fontSize: 'large' }, order_index: 0 },
        { type: 'estatisticas_larga', content: { items: [{title: 'AWARDS', desc: '24'}, {title: 'PROJECTS', desc: '150+'}, {title: 'COUNTRIES', desc: '12'}, {title: 'CLIENTS', desc: '80'}] }, style: { theme: 'dark' }, order_index: 1 },
        { type: 'servicos_modern', content: { title: 'Core Expertise', items: [{title: 'Branding', desc: 'Visual identity and strategy.'}, {title: 'Development', desc: 'Scalable web applications.'}, {title: 'Marketing', desc: 'Performance-driven growth.'}] }, style: { theme: 'light', cols: '3' }, order_index: 2 },
        { type: 'galeria_grid', content: { title: 'Selected Projects' }, style: { theme: 'light', cols: '2' }, order_index: 3 },
        { type: 'hero_comercial', content: { title: 'Our Methodology', sub: 'Design-driven approach to complex business problems.' }, style: { theme: 'light', align: 'center', fontSize: 'small' }, order_index: 4 },
        { type: 'servicos_modern', content: { title: 'Secondary Services', items: [{title: 'UI/UX Audit', desc: 'Optimizing conversions.'}, {title: 'Motion Design', desc: 'Bringing brands to life.'}] }, style: { theme: 'light', cols: '2' }, order_index: 5 },
        { type: 'contacto_mapa', content: { title: 'Ready to Scale?', phone: '+258 84 000 0000', email: 'hello@agency.com' }, style: { theme: 'dark' }, order_index: 6 }
      ] 
    },
    saas_product: { 
      label: 'SaaS / App', 
      icon: <Layout size={22} />,
      description: 'Feature-heavy layout focused on conversions and software benefits.',
      sections: [
        { type: 'hero_comercial', content: { title: 'The Future of Workflow', sub: 'One platform to manage projects, track time, and automate your invoices.' }, style: { theme: 'light', align: 'center', fontSize: 'medium' }, order_index: 0 },
        { type: 'estatisticas_larga', content: { items: [{title: 'UPTIME', desc: '99.9%'}, {title: 'USERS', desc: '1M+'}, {title: 'RATING', desc: '4.9'}, {title: 'SECURITY', desc: 'SSL+'}] }, style: { theme: 'dark' }, order_index: 1 },
        { type: 'servicos_modern', content: { title: 'Why Choose Us', items: [{title: 'Cloud First', desc: 'Access from anywhere.'}, {title: 'Bank-Level Security', desc: 'Your data is encrypted.'}, {title: 'AI Insights', desc: 'Predictive analytics built-in.'}] }, style: { theme: 'light', cols: '3' }, order_index: 2 },
        { type: 'precos_moderno', content: { title: 'Flexible Plans' }, style: { theme: 'light' }, order_index: 3 },
        { type: 'servicos_modern', content: { title: 'Enterprise Features', items: [{title: 'SSO Login', desc: 'Enterprise security.'}, {title: 'Custom API', desc: 'Unlimited integrations.'}, {title: 'Priority Support', desc: '24/7 dedicated team.'}, {title: 'Audit Logs', desc: 'Track every change.'}] }, style: { theme: 'light', cols: '4' }, order_index: 4 },
        { type: 'contacto_mapa', content: { title: 'Get a Demo' }, style: { theme: 'light' }, order_index: 5 }
      ] 
    },
    photography: { 
      label: 'Photography', 
      icon: <ImageIcon size={22} />,
      description: 'Visual storytelling with multiple gallery sections.',
      sections: [
        { type: 'hero_comercial', content: { title: 'Capturing Silence', sub: 'Fine art photography based in Maputo, available worldwide.' }, style: { theme: 'light', align: 'left', fontSize: 'small' }, order_index: 0 },
        { type: 'galeria_grid', content: { title: 'Commercial Portfolio' }, style: { theme: 'light', cols: '4' }, order_index: 1 },
        { type: 'estatisticas_larga', content: { items: [{title: 'EXPOSITIONS', desc: '05'}, {title: 'AWARDS', desc: '12'}, {title: 'BOOKS', desc: '01'}, {title: 'YEARS', desc: '15'}] }, style: { theme: 'dark' }, order_index: 2 },
        { type: 'galeria_grid', content: { title: 'Personal Collection' }, style: { theme: 'light', cols: '2' }, order_index: 3 },
        { type: 'servicos_modern', content: { title: 'Services', items: [{title: 'Wedding', desc: 'The big day.'}, {title: 'Editorial', desc: 'Fashion and covers.'}, {title: 'Studio', desc: 'Corporate portraits.'}] }, style: { theme: 'light', cols: '3' }, order_index: 4 },
        { type: 'contacto_mapa', content: { title: 'Book your Date' }, style: { theme: 'light' }, order_index: 5 }
      ] 
    },
    personal_brand: { 
      label: 'Personal Brand', 
      icon: <Star size={22} />,
      description: 'Expert-led design for coaches, speakers, and authors.',
      sections: [
        { type: 'hero_comercial', content: { title: 'Master Your Business', sub: 'I help entrepreneurs scale their revenue through strategic mentoring.' }, style: { theme: 'dark', align: 'center', fontSize: 'medium' }, order_index: 0 },
        { type: 'estatisticas_larga', content: { items: [{title: 'STUDENTS', desc: '5k+'}, {title: 'TALKS', desc: '200+'}, {title: 'ROI', desc: '5x'}, {title: 'FOLLOWERS', desc: '50k+'}] }, style: { theme: 'dark' }, order_index: 1 },
        { type: 'servicos_modern', content: { title: 'Work with Me', items: [{title: 'One-on-One', desc: 'Limited availability.'}, {title: 'Mastermind', desc: 'Group sessions.'}, {title: 'Keynotes', desc: 'Events and workshops.'}] }, style: { theme: 'light', cols: '3' }, order_index: 2 },
        { type: 'precos_moderno', content: { title: 'Program Enrollment' }, style: { theme: 'light' }, order_index: 3 },
        { type: 'hero_comercial', content: { title: 'As Seen On', sub: 'Featured in Forbes, TechCrunch, and Business Insider.' }, style: { theme: 'light', align: 'center', fontSize: 'small' }, order_index: 4 },
        { type: 'contacto_mapa', content: { title: 'Apply to Mentor' }, style: { theme: 'light' }, order_index: 5 }
      ] 
    },
    event_page: { 
      label: 'Event / Launch', 
      icon: <ArrowRight size={22} />,
      description: 'High-energy layout for conferences and product launches.',
      sections: [
        { type: 'hero_comercial', content: { title: 'Tech Summit 2026', sub: 'Join 500+ leaders for the largest tech event in East Africa.' }, style: { theme: 'dark', align: 'center', fontSize: 'large' }, order_index: 0 },
        { type: 'estatisticas_larga', content: { items: [{title: 'DAYS', desc: '02'}, {title: 'SPEAKERS', desc: '25'}, {title: 'WORKSHOPS', desc: '10'}, {title: 'PARTNERS', desc: '50+'}] }, style: { theme: 'dark' }, order_index: 1 },
        { type: 'servicos_modern', content: { title: 'Main Topics', items: [{title: 'Web3', desc: 'Future of finance.'}, {title: 'AI', desc: 'Practical automation.'}, {title: 'Sustainability', desc: 'Green tech focus.'}] }, style: { theme: 'light', cols: '3' }, order_index: 2 },
        { type: 'galeria_grid', content: { title: 'Past Editions' }, style: { theme: 'light', cols: '4' }, order_index: 3 },
        { type: 'precos_moderno', content: { title: 'Get your Ticket' }, style: { theme: 'light' }, order_index: 4 },
        { type: 'contacto_mapa', content: { title: 'Sponsorships' }, style: { theme: 'light' }, order_index: 5 }
      ] 
    },
    blank: { label: 'Empty Canvas', icon: <Plus size={22} />, description: 'Fresh start with no sections.', sections: [] }
  };