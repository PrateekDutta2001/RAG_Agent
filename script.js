document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Typewriter
  const words = ['Grounded.', 'Accurate.', 'Up-to-date.', 'Scalable.'];
  const twEl = document.getElementById('typewriter');
  let wi = 0, ci = 0, deleting = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function typeTick() {
    if (reducedMotion) { twEl.textContent = words[0]; return; }
    const word = words[wi];
    if (!deleting) {
      twEl.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(typeTick, 1800); return; }
      setTimeout(typeTick, 80);
    } else {
      twEl.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(typeTick, 400); return; }
      setTimeout(typeTick, 40);
    }
  }
  typeTick();

  // Mobile Nav
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // IntersectionObserver: fade-up + flow animation
  const observeEls = document.querySelectorAll('.observe, .rag-card, .intro-block, .types-divider');
  const sectionIds = ['what-is-rag','rag-architecture','rag-origins','rag-types','naive-rag','advanced-rag','modular-rag','agentic-rag','graph-rag','multimodal-rag','compare','decision'];
  const navAnchors = document.querySelectorAll('.nav-links a');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('rag-card')) animateFlow(entry.target);
        if (entry.target.id === 'rag-architecture') animateFlow(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  observeEls.forEach(el => fadeObserver.observe(el));

  function animateFlow(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = 'true';
    const diagram = el.querySelector('.flow-diagram');
    if (!diagram) return;
    const nodes = diagram.querySelectorAll('.flow-step');
    const arrows = diagram.querySelectorAll('.flow-arrow');
    const loopBox = diagram.querySelector('.flow-loop-box');
    const total = nodes.length;
    const delay = reducedMotion ? 0 : 350;

    nodes.forEach((node, i) => {
      setTimeout(() => {
        const rect = node.querySelector('.flow-node');
        if (rect) {
          const isLast = i === total - 1;
          rect.classList.add(isLast ? 'lit-warm' : 'lit');
        }
        if (loopBox && i >= 2 && i <= 4) loopBox.classList.add('lit');
        if (arrows[i]) arrows[i].classList.add(i === total - 1 ? 'lit-warm' : 'lit');
      }, i * delay);
    });
  }

  // Active nav highlight
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-64px 0px -50% 0px' });

  sections.forEach(s => navObserver.observe(s));

  // Decision Flow (scoring-based)
  const ragProfiles = {
    naive: {
      title: 'Naive RAG',
      body: 'Your use case favors a fast, straightforward pipeline: chunk documents, embed, retrieve top-K, and generate. Ideal when users need instant answers from well-structured text corpora.',
      tags: ['FAISS', 'LangChain', 'Chroma', 'Low latency']
    },
    advanced: {
      title: 'Advanced RAG',
      body: 'Precision and citation quality are critical in your domain. Add query rewriting (HyDE), hybrid BM25+vector retrieval, and cross-encoder re-ranking to dramatically reduce hallucination in high-stakes Q&A.',
      tags: ['Cohere Rerank', 'HyDE', 'BM25 hybrid', 'Legal & compliance']
    },
    modular: {
      title: 'Modular RAG',
      body: 'Your organization has heterogeneous data silos that need intelligent routing. Build a composable pipeline with query routers, pluggable retrievers (SQL, vector, web), and fusion layers.',
      tags: ['LangGraph', 'Query routing', 'Enterprise', 'Multi-source']
    },
    agentic: {
      title: 'Agentic RAG',
      body: 'Your users need deep, multi-step investigation - not a single retrieval pass. An LLM agent decomposes queries, retrieves iteratively, cross-checks sources, and self-corrects before answering.',
      tags: ['ReAct', 'Tool calling', 'Research', 'PubMed / literature']
    },
    graph: {
      title: 'Graph RAG',
      body: 'Your data is rich in entity relationships - drugs, conditions, organizations, supply chains. Build a knowledge graph and traverse multi-hop paths that flat vector search cannot capture.',
      tags: ['Neo4j', 'Cypher', 'Entity extraction', 'Healthcare']
    },
    multimodal: {
      title: 'Multimodal RAG',
      body: 'Your knowledge spans images, diagrams, tables, and text. Use CLIP-style embeddings across modality-specific indexes, fuse results, and generate with a vision-capable LLM.',
      tags: ['CLIP', 'GPT-4V', 'Cross-modal', 'Manufacturing']
    }
  };

  const scoreMap = {
    q1: {
      support:       { naive: 3, modular: 1 },
      legal:         { advanced: 3, graph: 1 },
      research:      { agentic: 3, advanced: 1 },
      enterprise:    { modular: 3, naive: 1 },
      healthcare:    { graph: 3, agentic: 1 },
      manufacturing: { multimodal: 3, graph: 1 }
    },
    q2: {
      'text-docs':        { naive: 3 },
      'precision-corpus': { advanced: 3, naive: 1 },
      'multi-source':     { modular: 4 },
      'entity-graph':     { graph: 4 },
      'multimodal':       { multimodal: 4 }
    },
    q3: {
      speed:         { naive: 4 },
      precision:     { advanced: 4 },
      routing:       { modular: 4 },
      reasoning:     { agentic: 4 },
      relationships: { graph: 4 },
      visual:        { multimodal: 4 }
    }
  };

  const domainNotes = {
    support: 'Common in SaaS support bots answering "How do I reset 2FA?" from help-center docs.',
    legal: 'Typical for contract clause lookup where a wrong citation has real consequences.',
    research: 'Used by biomedical teams synthesizing findings across thousands of papers.',
    enterprise: 'Powers unified assistants that route HR queries to SQL and product queries to vector stores.',
    healthcare: 'Essential for drug interaction checks traversing contraindication relationships.',
    manufacturing: 'Enables defect photo analysis against repair manuals and past incident reports.'
  };

  const answers = {};
  const q2 = document.getElementById('q2');
  const q3 = document.getElementById('q3');
  const result = document.getElementById('decisionResult');
  const resultTitle = document.getElementById('resultTitle');
  const resultBody = document.getElementById('resultBody');
  const resultSecondary = document.getElementById('resultSecondary');
  const resultTags = document.getElementById('resultTags');

  document.querySelectorAll('.q-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      const v = btn.dataset.v;
      answers[q] = v;
      btn.parentElement.querySelectorAll('.q-btn').forEach(b => {
        b.classList.toggle('selected', b === btn);
        b.disabled = true;
      });

      if (q === '1') q2.style.display = 'block';
      else if (q === '2') q3.style.display = 'block';
      else if (q === '3') showRecommendation();
    });
  });

  function showRecommendation() {
    const scores = { naive: 0, advanced: 0, modular: 0, agentic: 0, graph: 0, multimodal: 0 };
    Object.entries(answers).forEach(([q, v]) => {
      const boosts = scoreMap['q' + q][v] || {};
      Object.entries(boosts).forEach(([type, pts]) => { scores[type] += pts; });
    });

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const winner = sorted[0][0];
    const runnerUp = sorted[1][0];
    const profile = ragProfiles[winner];
    const runnerProfile = ragProfiles[runnerUp];

    resultTitle.textContent = 'Recommended: ' + profile.title;
    resultBody.textContent = profile.body;
    resultSecondary.textContent = domainNotes[answers['1']] || '';
    resultTags.innerHTML = profile.tags.map(t => '<span class="result-tag">' + t + '</span>').join('');

    if (sorted[1][1] > 0 && sorted[0][1] - sorted[1][1] <= 2) {
      resultSecondary.textContent += ' Also consider ' + runnerProfile.title + ' as a strong alternative for your setup.';
    }

    result.classList.add('show');
    result.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
  }

  document.getElementById('decisionReset').addEventListener('click', () => {
    Object.keys(answers).forEach(k => delete answers[k]);
    q2.style.display = 'none';
    q3.style.display = 'none';
    result.classList.remove('show');
    resultSecondary.textContent = '';
    resultTags.innerHTML = '';
    document.querySelectorAll('.q-btn').forEach(b => {
      b.classList.remove('selected');
      b.disabled = false;
    });
  });
});
