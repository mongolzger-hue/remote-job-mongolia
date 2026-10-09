// Only the public job page URL is sent; account cookies and private data are excluded.
export function mongolianTranslationUrl(publicPage:string){
 const source=new URL(publicPage);
 if(!['https:','http:'].includes(source.protocol)||source.username||source.password)throw new Error('Invalid public page URL');
 const target=new URL('https://translate.google.com/translate');
 target.search=new URLSearchParams({sl:'auto',tl:'mn',u:source.href}).toString();
 return target.href;
}
