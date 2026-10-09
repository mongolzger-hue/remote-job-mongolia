'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="shell empty"><h1>Unable to load this page</h1><p>Check your database configuration and try again.</p><button className="button" onClick={reset}>Try again / Дахин оролдох</button></main>}
