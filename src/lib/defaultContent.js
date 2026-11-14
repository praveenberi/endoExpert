// Seed content. Everything here is editable from the Admin Dashboard;
// React components never hardcode copy – they read from the content store.
// Only verified facts should be added to the doctor, testimonial and contact fields.

const day = (open, start = '10:00', end = '20:30') => ({ open, start, end })

export const defaultContent = {
  _v: 4, // content schema version; see migrate() in store.js
  version: 1,
  branding: {
    clinicName: 'ENDO EXPERT',
    tagline: 'MICROENDODONTICS',
    logo: '/logo.png',
    favicon: '/logo.png',
    primary: '#0e7490',
    secondary: '#2dd4bf',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
  },
  settings: {
    clinicFullName: 'ENDO EXPERT Microendodontics & Implant Centre',
    phone: '',
    whatsapp: '+91 81238 21907',
    whatsappMessage: 'Hello ENDO EXPERT, I would like to book an appointment.',
    email: '',
    address: 'No. 279, 15th A Cross, opposite Abhishek Nethradhama,\nBengaluru, Karnataka 560064',
    mapUrl: 'https://maps.app.goo.gl/WFFHXJUSHT6KHW1j7',
    mapEmbedUrl: '',
    social: { instagram: '', facebook: '', youtube: '', linkedin: '' },
    slotMinutes: 30,
    hours: {
      mon: day(true), tue: day(true), wed: day(true), thu: day(true),
      fri: day(true), sat: day(true), sun: day(false),
    },
    scrollMascot: true,
    footerText: 'Precision dentistry. Beyond what the eye can see.',
  },
  nav: [
    { id: 'n1', label: 'Home', href: '#home' },
    { id: 'n2', label: 'About', href: '#about' },
    { id: 'n3', label: 'Treatments', href: '#treatments' },
    { id: 'n4', label: 'Technology', href: '#technology' },
    { id: 'n5', label: 'Our Doctor', href: '#doctor' },
    { id: 'n6', label: 'Patient Guide', href: '#faq' },
    { id: 'n7', label: 'Contact', href: '#contact' },
  ],
  navCta: { label: 'Book Appointment', href: '#contact' },
  // Ordered list of page sections. type -> component. Admin can reorder / hide / delete / add.
  sections: [
    { id: 'home', type: 'hero', visible: true },
    { id: 'about', type: 'about', visible: true },
    { id: 'treatments', type: 'treatments', visible: true },
    { id: 'why', type: 'why', visible: true },
    { id: 'doctor', type: 'doctor', visible: true },
    { id: 'team', type: 'staff', visible: true },
    { id: 'technology', type: 'technology', visible: true },
    { id: 'journey', type: 'journey', visible: true },
    { id: 'testimonials', type: 'testimonials', visible: true },
    { id: 'faq', type: 'faq', visible: true },
    { id: 'contact', type: 'contact', visible: true },
  ],
  hero: {
    eyebrow: 'Microendodontics',
    heading: 'Precision Dentistry. Beyond What the Eye Can See.',
    subtitle:
      'Experience advanced microendodontic care where precision meets technology. At ENDO EXPERT, we focus on diagnosing and treating complex root canal conditions with advanced magnification and a patient-centred approach.',
    primaryBtn: { label: 'Book an Appointment', href: '#contact' },
    secondaryBtn: { label: 'Discover Our Expertise', href: '#about' },
    backgroundImage: '',
    sideVideo: '/hero-tooth.mp4',
    show3d: true,
    toothSpeed: 0.6,
  },
  about: {
    eyebrow: 'About ENDO EXPERT',
    heading: 'Where Precision Meets Excellence',
    body:
      'ENDO EXPERT – MICROENDODONTICS is dedicated to advanced endodontic diagnosis and treatment, with a focus on preserving natural teeth.\n\nUsing modern dental technology and magnification-assisted techniques, we aim to deliver precise, carefully planned treatment for routine and complex root canal conditions.\n\nOur philosophy is simple: preserve natural teeth whenever possible, prioritise patient comfort and deliver quality dental care through precision and expertise.',
    pillars: [
      { id: 'p1', title: 'Our philosophy', text: 'Preserve natural teeth whenever possible.' },
      { id: 'p2', title: 'Our approach', text: 'Careful diagnosis and precisely planned treatment.' },
      { id: 'p3', title: 'Our commitment', text: 'Patient comfort and quality care, every visit.' },
    ],
    images: [],
  },
  treatmentsSection: {
    eyebrow: 'Our Specialities',
    heading: 'Advanced Care for Every Root Canal Need',
    subtitle: 'Select a treatment to learn more.',
  },
  treatments: [
    { id: 't1', mascot: 'mirror', slug: 'root-canal-treatment', published: true, icon: '🦷', title: 'Root Canal Treatment', summary: 'Precision-based treatment to manage infection and preserve natural teeth.', details: 'Root canal treatment removes infected or inflamed tissue from inside the tooth, disinfects the canal system and seals it so the natural tooth can be preserved.', image: '' },
    { id: 't2', mascot: 'magnifier', slug: 'microscope-assisted-endodontics', published: true, icon: '🔬', title: 'Microscope-Assisted Endodontics', summary: 'Enhanced visualisation for detailed dental procedures.', details: 'A dental operating microscope magnifies and illuminates the inside of the tooth, helping the clinician see fine anatomy that is difficult to see with the naked eye.', image: '' },
    { id: 't3', mascot: 'brush', slug: 're-root-canal-treatment', published: true, icon: '🔁', title: 'Re-Root Canal Treatment', summary: 'Assessment and management of previously treated teeth with persistent problems.', details: 'When a previously treated tooth continues to cause problems, retreatment may be considered to clean and re-seal the canal system.', image: '' },
    { id: 't4', mascot: 'shield', slug: 'endodontic-microsurgery', published: true, icon: '✨', title: 'Endodontic Microsurgery', summary: 'Surgical treatment for selected conditions affecting the root of a tooth.', details: 'Endodontic microsurgery treats the tip of the root when conventional root canal treatment is not sufficient or possible, using magnification for precision.', image: '' },
    { id: 't5', mascot: 'stethoscope', slug: 'complex-root-canal-cases', published: true, icon: '🧩', title: 'Complex Root Canal Cases', summary: 'Evaluation and management of challenging root canal conditions.', details: 'Calcified, curved or unusually shaped canals and other challenging conditions are assessed carefully with magnification and detailed imaging.', image: '' },
    { id: 't6', mascot: 'trauma', slug: 'dental-trauma-management', published: true, icon: '🛡️', title: 'Dental Trauma Management', summary: 'Assessment and treatment planning for injured teeth.', details: 'Injured teeth need prompt assessment. Treatment planning depends on the type of injury and the stage of root development.', image: '' },
  ],
  why: {
    eyebrow: 'Why Choose ENDO EXPERT?',
    heading: 'A Higher Standard of Precision',
    items: [
      { id: 'w1', icon: '🔍', title: 'Advanced magnification', text: 'Microscope-assisted visualisation of fine canal anatomy.' },
      { id: 'w2', icon: '📋', title: 'Detailed planning', text: 'Thorough diagnosis and treatment planning.' },
      { id: 'w3', icon: '🦷', title: 'Natural tooth preservation', text: 'Saving your own tooth is always the first aim.' },
      { id: 'w4', icon: '🧩', title: 'Complex conditions', text: 'Focused attention on challenging dental conditions.' },
      { id: 'w5', icon: '🤝', title: 'Patient-centred', text: 'Personalised care built around your needs.' },
      { id: 'w6', icon: '🏥', title: 'Modern environment', text: 'A clean, modern and comfortable clinic.' },
    ],
  },
  doctor: {
    eyebrow: 'Meet Our Specialist',
    heading: 'Expertise You Can Trust',
    name: 'Dr. Prasanna Kumar Beri',
    designation: 'Endodontist',
    photo: '/doctor.jpg',
    intro:
      "At ENDO EXPERT, every treatment begins with understanding the patient's needs. Our approach combines clinical knowledge, careful diagnosis and modern technology to provide personalised endodontic care.",
    biography: '',
    qualifications: [],
    experience: '',
    specialisations: ['Microendodontics'],
    memberships: [],
    achievements: [],
  },
  technology: {
    eyebrow: 'Advanced Technology',
    heading: 'Precision Through Advanced Technology',
    body: 'Magnification reveals intricate root canal structures that are hard to see unaided. Drag the slider to explore how increasing magnification uncovers finer detail.',
    videos: [
      { id: 'v1', url: '/videos/tech-1.mp4', caption: 'Scanning the tooth with digital X-ray imaging' },
      { id: 'v2', url: '/videos/tech-2.mp4', caption: 'Microscope view of the root canal' },
      { id: 'v3', url: '/videos/tech-3.mp4', caption: 'Endodontic file cleaning the canal' },
      { id: 'v4', url: '/videos/tech-4.mp4', caption: 'Sensor scan of a 3D tooth model' },
    ],
    items: [
      { id: 'x1', title: 'Dental operating microscopes', text: 'Magnified, illuminated view inside the tooth.' },
      { id: 'x2', title: 'Digital dental imaging', text: 'Detailed images to support diagnosis and planning.' },
      { id: 'x3', title: 'Advanced endodontic instruments', text: 'Fine instruments designed for delicate canal anatomy.' },
      { id: 'x4', title: 'Magnification-assisted procedures', text: 'Improved visibility at every step of treatment.' },
      { id: 'x5', title: 'Modern diagnostic techniques', text: 'Appropriate tests to understand the problem accurately.' },
    ],
  },
  journey: {
    eyebrow: 'Patient Journey',
    heading: 'Your Journey Towards Better Dental Health',
    steps: [
      { id: 'j1', title: 'Consultation', text: 'Understand your concerns and dental history.' },
      { id: 'j2', title: 'Diagnosis', text: 'Clinical examination and appropriate diagnostic imaging.' },
      { id: 'j3', title: 'Personalised Treatment', text: 'Discuss treatment options and proceed with an appropriate care plan.' },
      { id: 'j4', title: 'Follow-up', text: 'Review healing and monitor treatment outcomes.' },
    ],
  },
  testimonialsSection: {
    eyebrow: 'Patient Testimonials',
    heading: 'Stories of Confidence and Care',
    googleReviewsUrl: '',
  },
  // Only add genuine, consented patient feedback. The section hides itself while this is empty.
  testimonials: [],
  faqSection: { eyebrow: 'Patient Guide', heading: 'Frequently Asked Questions' },
  faqs: [
    { id: 'f1', q: 'What is microendodontics?', a: 'Microendodontics is root canal care performed with magnification (usually a dental operating microscope) so that fine canal anatomy can be seen and treated more precisely.' },
    { id: 'f2', q: 'Why is a dental microscope used during root canal treatment?', a: 'The microscope magnifies and illuminates the inside of the tooth, helping the clinician locate and clean canals that are difficult to see unaided.' },
    { id: 'f3', q: 'Is root canal treatment painful?', a: 'Treatment is performed under local anaesthesia, so most patients feel pressure rather than pain. Some mild soreness afterwards is common and can usually be managed with simple measures advised by your dentist.' },
    { id: 'f4', q: 'When do I need a second root canal treatment?', a: 'Retreatment may be considered if a previously treated tooth develops persistent pain, swelling or signs of infection on examination or imaging.' },
    { id: 'f5', q: 'Can a severely damaged tooth be saved?', a: 'Often, yes – but it depends on how much sound tooth structure remains and the condition of the root. A clinical examination and imaging are needed to advise you.' },
    { id: 'f6', q: 'What is endodontic microsurgery?', a: 'A minor surgical procedure, performed with magnification, that treats the root tip when conventional root canal treatment is not enough.' },
    { id: 'f7', q: 'How long does treatment take?', a: 'It varies with the tooth and the complexity of the case. Your dentist will give you an estimate after the initial assessment.' },
    { id: 'f8', q: 'How do I book an appointment?', a: 'Use the booking form on this page, call or WhatsApp the clinic. Sunday appointments are not available.' },
  ],
  contact: {
    eyebrow: 'Contact & Appointments',
    heading: 'Your Smile Deserves Expert Care',
    subtitle: 'Request an appointment below. The clinic will confirm your slot.',
  },
  // Staff members are added in Admin → Staff. Nothing is pre-filled so no unverified details appear.
  staff: {
    eyebrow: 'Our Team',
    heading: 'The People Behind Your Care',
    subtitle: 'A dedicated team supporting every step of your treatment.',
    members: [],
  },
  customSections: [],
  seo: {
    title: 'ENDO EXPERT – MICROENDODONTICS | Precision Root Canal Care',
    description: 'ENDO EXPERT offers advanced microscope-assisted root canal treatment, retreatment and endodontic microsurgery with a focus on saving natural teeth.',
    keywords: 'microendodontics, root canal, endodontist, dental microscope, re-root canal, endodontic microsurgery',
    ogTitle: 'ENDO EXPERT – MICROENDODONTICS',
    ogDescription: 'Precision dentistry. Beyond what the eye can see.',
    ogImage: '',
    canonical: '',
  },
}

export const DAYS = [
  ['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'],
  ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday'],
]
