// Shared coach data — imported by coaches/index.tsx and coaches/[id].tsx
// TODO: replace INITIAL_COACHES with Supabase query:
//   const { data } = await supabase.from('coaches').select('*').order('index')

export interface Coach {
  id: string;
  name: string;
  title: string;
  focus: string;
  tags: string[];
  bio: string;
  index: string;
}

export const INITIAL_COACHES: Coach[] = [
  { id: 'jessie-li',    name: 'Jessie Li',   title: 'Founder & Lead Coach', focus: 'Executive Leadership', tags: ['Leadership', 'Venture Building', 'Inner Work'], bio: 'Jessie works with founders and executives navigating high-stakes transitions, helping them lead with clarity and conviction.',   index: '01' },
  { id: 'coach-two',   name: 'Coming Soon', title: 'Executive Coach',       focus: 'Wellness & Vitality',  tags: ['Wellness', 'Performance', 'Resilience'],         bio: 'A world-class coach specialising in sustainable performance and vitality for leaders under pressure.',                         index: '02' },
  { id: 'coach-three', name: 'Coming Soon', title: 'Mentor & Advisor',      focus: 'Venture Building',     tags: ['Startups', 'Fundraising', 'Scale'],              bio: 'Accelerator mentor and operator who has built and scaled ventures across Southeast Asia and the US.',                          index: '03' },
  { id: 'coach-four',  name: 'Coming Soon', title: 'Spiritual Guide',       focus: 'Spiritual Growth',     tags: ['Mindfulness', 'Purpose', 'Clarity'],             bio: 'Guides leaders through the deeper inner work that unlocks clarity, presence, and untapped potential.',                        index: '04' },
];
