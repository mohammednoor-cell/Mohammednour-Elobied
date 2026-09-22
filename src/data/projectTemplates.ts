import { ProjectTemplate } from '../types';

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'event-planning',
    name: 'Event Planning',
    nameAr: 'تخطيط وتنظيم الفعاليات',
    description: 'Full-cycle production structure for high-profile gatherings, gala dinners, and exhibitions.',
    descriptionAr: 'هيكلية إنتاج شاملة للملتقيات الكبرى وحفلات العشاء والمعارض المتخصصة.',
    category: 'Experiential',
    defaultPriority: 'High',
    icon: '🎪',
    badge: 'Popular',
    deliverables: [
      { text: 'Venue floorplan, stage CAD layout & crowd circulation matrix', textAr: 'مخطط الموقع الهندسي، وتوزيع المسرح وحركة الحضور' },
      { text: 'VIP protocol briefing, royal entrance staging & guest registration flow', textAr: 'خطة مراسم كبار الشخصيات ومسار التسجيل والترحيب' },
      { text: 'Curved LED screen content, AV audio engineering & master run-of-show', textAr: 'محتوى الشاشات المنحنية وهندسة الصوت وجدول التشغيل الدقيق' },
      { text: 'Supplier contracts, technical rigging & civil defense compliance permits', textAr: 'عقود الموردين، تراخيص الدفاع المدني والسلامة الإنشائية' },
      { text: 'Dry run walkthrough, cue-to-cue rehearsal & executive handover', textAr: 'التجربة التشغيلية الشاملة والبروفة النهائية والتسليم التنفيذي' }
    ]
  },
  {
    id: 'brand-campaign',
    name: 'Brand Campaign',
    nameAr: 'حملة الهوية والعلامة التجارية',
    description: 'Strategic branding, motion design, spatial guidelines, and cross-channel campaign rollout.',
    descriptionAr: 'بناء الهوية البصرية، وتطبيقات التجربة المكانية والمحتوى الحركي وإطلاق الحملة.',
    category: 'Brand & Design',
    defaultPriority: 'High',
    icon: '✨',
    badge: 'Creative',
    deliverables: [
      { text: 'Creative brand narrative, strategic pillars & manifesto development', textAr: 'صياغة المفهوم الإبداعي وركائز العلامة والبيان السردي' },
      { text: 'Bilingual typography system, color tokens & spatial design standards', textAr: 'نظام الخطوط ثنائية اللغة ولوحة الألوان وتطبيقات الهوية المكانية' },
      { text: 'Hero motion graphics suite, 3D animated identity & teaser cuts', textAr: 'حزمة الموشن جرافيك الثلاثية الأبعاد ومقاطع الفيديو التشويقية' },
      { text: 'Executive presentation deck & client stakeholder sign-off', textAr: 'العرض التقديمي التنفيذي واعتماد أصحاب المصلحة' },
      { text: 'Digital asset export pack & multi-channel social campaign deployment', textAr: 'تصدير الأصول الرقمية وإطلاق الحملة عبر المنصات الرقمية' }
    ]
  },
  {
    id: 'client-onboarding',
    name: 'Client Onboarding',
    nameAr: 'استيعاب وتهيئة العميل الجديد',
    description: 'Structured framework for new client kick-off, contract setup, and roadmap alignment.',
    descriptionAr: 'إطار عمل منظم لبدء الشراكة مع العميل الجديد، وصياغة العقود وتحديد خارطة الطريق.',
    category: 'Strategy',
    defaultPriority: 'Medium',
    icon: '🤝',
    badge: 'Operations',
    deliverables: [
      { text: 'Discovery session, stakeholder requirements & success KPI definition', textAr: 'جلسة الاستكشاف وحصر متطلبات ومؤشرات نجاح المشروع' },
      { text: 'Scope of Work (SOW), budget milestones & Master Services Agreement', textAr: 'اعتماد نطاق العمل (SOW) ومراحل الدفعات والعقد الرئيسي' },
      { text: 'Dedicated communication channels, shared Drive repository & cadence setup', textAr: 'قنوات التواصل المخصصة والمجلد المشترك وجدول الاجتماعات الدورية' },
      { text: 'Resource allocation, project manager assignment & kickoff deck delivery', textAr: 'توزيع الموارد وتعيين مدير المشروع وتقديم عرض الانطلاق' }
    ]
  },
  {
    id: 'vip-protocol',
    name: 'VIP & Protocol Experience',
    nameAr: 'مراسم وبروتوكول كبار الشخصيات',
    description: 'High-security guest journeys, tokenized registration badges, and presidential lounge ops.',
    descriptionAr: 'مسارات الضيوف الرفيعة، والشارات الرقمية المؤمنة، وتشغيل صالات كبار الشخصيات.',
    category: 'VIP & Protocol',
    defaultPriority: 'High',
    icon: '👑',
    badge: 'Executive',
    deliverables: [
      { text: 'Government & sovereign delegation registry alignment', textAr: 'مطابقة وتدقيق قوائم الوفود الرسمية والدبلوماسية' },
      { text: 'Dynamic QR encrypted badge printing kiosks & luxury lanyards setup', textAr: 'أجهزة الطباعة الفورية للبطاقات المشفرة والشرائط الفاخرة' },
      { text: 'Bilingual protocol escort officers team assignment & briefing', textAr: 'توزيع وتوجيه فريق مرافقي المراسم ثنائيي اللغة' },
      { text: 'Real-time arrival sensor dashboard & executive seating management', textAr: 'لوحة متابعة الوصول اللحظية وإدارة المقاعد المخصصة' }
    ]
  },
  {
    id: 'interactive-tech',
    name: 'Interactive Tech Installation',
    nameAr: 'التجهيزات التقنية التفاعلية',
    description: 'Sensory stations, interactive projection mapping, and real-time graphics pipelines.',
    descriptionAr: 'محطات الاستشعار التفاعلية، ورسم الخرائط الضوئية، ومعالجة الرسوم اللحظية.',
    category: 'Interactive Tech',
    defaultPriority: 'Medium',
    icon: '⚡',
    badge: 'Tech',
    deliverables: [
      { text: 'Sensory hardware procurement, curved displays & multi-touch overlays', textAr: 'تأمين أجهزة الاستشعار والشاشات المنحنية وأنظمة اللمس المتعدد' },
      { text: 'Real-time interactive software pipeline running at locked 60 FPS', textAr: 'تطوير البرمجية التفاعلية بمعدل تحديث مستقر 60 إطار بالثانية' },
      { text: 'Local high-availability media server setup with automatic failover', textAr: 'تجهيز خوادم العرض المحلية عالية التوافر بنظام التبديل التلقائي' },
      { text: 'Stress testing, accessibility signoff & live staging rehearsal', textAr: 'اختبارات الحمل وضمان سهولة الاستخدام والبروفة الميدانية' }
    ]
  }
];
