import {Code2,Headphones,Palette,Megaphone,PenLine,BriefcaseBusiness,Handshake,Settings2} from 'lucide-react';

// Category artwork, rather than an unverified company logo.
export default function JobArt({category}:{category:string}) {
 const icons:Record<string,typeof Code2>={Engineering:Code2,Design:Palette,Marketing:Megaphone,'Customer support':Headphones,Writing:PenLine,Sales:Handshake,Operations:Settings2};
 const Icon=icons[category]||BriefcaseBusiness;
 return <div className="company-logo job-art" aria-hidden="true" data-category={category}><Icon size={27} strokeWidth={1.8}/></div>;
}
