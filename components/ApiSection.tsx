import React, { useState } from 'react';
import { GitHubIcon, TimeIcon } from './Icons';

const nextjsCode = `
// A React component for fetching and displaying data in Next.js.
// This example demonstrates modern async/await and hooks.

import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const response = await fetch(\`/api/users/\${userId}\`);
      const data = await response.json();
      setUser(data);
      setLoading(false);
    };
    fetchUser();
  }, [userId]);

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>User not found.</p>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
    </div>
  );
}
`.trim();

const jsCode = `
// A vanilla JavaScript snippet for a smooth scroll-to-top button.
// This shows proficiency in DOM manipulation and event handling.

document.addEventListener('DOMContentLoaded', () => {
  const scrollTopButton = document.getElementById('scrollTopBtn');

  window.onscroll = () => {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      scrollTopButton.style.display = "block";
    } else {
      scrollTopButton.style.display = "none";
    }
  };

  scrollTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
`.trim();

const CodeLine: React.FC<{ number: number; line: string }> = ({ number, line }) => {
  const highlightedLine = line
    .replace(/\b(import|from|export|default|const|let|async|function|await|new|if|return|else|window|document)\b/g, '<span class="text-pink-400">$1</span>')
    .replace(/('.*?'|".*?"|`.*?`)/g, '<span class="text-green-400">$1</span>')
    .replace(/(\(|\)|\[|\]|\{|\})/g, '<span class="text-gray-500">$1</span>')
    .replace(/\b(useState|useEffect|fetch|addEventListener|getElementById|onscroll|scrollTo)\b/g, '<span class="text-sky-400">$1</span>');

  return (
    <div>
      <span className="text-gray-600 w-8 inline-block text-right pr-4 select-none">{number}</span>
      <span dangerouslySetInnerHTML={{ __html: highlightedLine }} />
    </div>
  );
};

interface ApiSectionProps {
  onGitHubClick: () => void;
}

const ApiSection: React.FC<ApiSectionProps> = ({ onGitHubClick }) => {
  const [lang, setLang] = useState('nextjs');

  const code = lang === 'nextjs' ? nextjsCode : jsCode;
  const lines = code.split('\n');

  return (
    <section className="py-24">
      <h2 className="text-4xl font-medium text-white tracking-tight text-center mb-12">
        A Glimpse Into My Code
      </h2>
      <div className="max-w-4xl mx-auto bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-medium">Clean, Efficient, and Modern Code</h3>
            <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
              <TimeIcon />
              <span>A glimpse into my approach to writing elegant and functional code.</span>
            </p>
          </div>
          <div className="bg-[#2a2a2a] p-1 rounded-md text-sm">
            <button 
              onClick={() => setLang('nextjs')}
              className={`px-3 py-1 rounded ${lang === 'nextjs' ? 'bg-[#3a3a3a] text-white' : 'text-gray-400'}`}
            >
              Next.js
            </button>
            <button 
              onClick={() => setLang('js')}
              className={`px-3 py-1 rounded ${lang === 'js' ? 'bg-[#3a3a3a] text-white' : 'text-gray-400'}`}
            >
              JavaScript
            </button>
          </div>
        </div>

        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
          <pre><code>
            {lines.map((line, index) => (
              <CodeLine key={index} number={index + 1} line={line} />
            ))}
          </code></pre>
        </div>

        <div className="mt-6">
          <button 
            onClick={onGitHubClick}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
            <GitHubIcon />
            <span>View on GitHub</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ApiSection;