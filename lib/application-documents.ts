export type ApplicationDetails={name:string;email:string;location:string;role:string;company:string;summary:string;skills:string;experience:string;education:string;languages:string;availability:string;motivation:string};
export function createApplicationDocuments(d:ApplicationDetails){
  const cv=[d.name,[d.email,d.location].filter(Boolean).join(' | '),d.role&&'TARGET ROLE: '+d.role,d.summary&&'PROFILE\n'+d.summary,d.skills&&'SKILLS\n'+d.skills,d.experience&&'EXPERIENCE / PROJECTS\n'+d.experience,d.education&&'EDUCATION / TRAINING\n'+d.education,d.languages&&'LANGUAGES\n'+d.languages,d.availability&&'AVAILABILITY\n'+d.availability].filter(Boolean).join('\n\n');
  const letter=['Dear Hiring Team,',`I am applying for ${d.role||'[role title]'}${d.company?' at '+d.company:''}.`,d.motivation,d.summary,d.experience&&'Relevant experience / projects:\n'+d.experience,[d.location&&'I am based in '+d.location+'.',d.availability].filter(Boolean).join(' '),'Thank you for considering my application. I would welcome the opportunity to discuss the role.','Best regards,',d.name,d.email].filter(Boolean).join('\n\n');
  return {cv,letter};
}
