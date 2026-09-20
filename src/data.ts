export const intro = ["Hi, I’m Kiran, an AI developer building agentic AI, computer vision and cloud solutions.", "I turn real-world problems into working software—here’s a look at my work."];

export type JourneyStop = { id:string; place:string; period:string; tags:string[]; body:string };
export const journey: JourneyStop[] = [
 { id:'geethaanjali', place:'Geethaanjali School, Erode', period:'Through Grade 10', tags:['School Foundation','Erode','Through Grade 10'],
   body:'Foundational schooling in Erode, through the 10th grade — where the basics of maths, science and curiosity were built.' },
 { id:'chaitanya', place:'Chaitanya Techno School', period:'Grades 11–12 · 2021–2023', tags:['Higher Secondary','Grades 11–12','2021–2023'],
   body:'Higher secondary education, grades 11 and 12, from 2021 to 2023 — the years the direction toward engineering and computing took shape.' },
 { id:'amrita', place:'Amrita Vishwa Vidyapeetham, Coimbatore', period:'2023–2027 · Currently pursuing', tags:['CSE (AI)','Coimbatore','2023–2027'],
   body:'B.Tech in Computer Science & Engineering (AI), Amrita School of AI. Currently pursuing, CGPA 8.06.' },
];

export type ExperienceRole = { period:string; role:string; org:string; location:string; body:string };
export const experience: ExperienceRole[] = [
 { period:'May 2026 — Jun 2026', role:'AI/ML Intern', org:'Latlon Technologies Pvt. Ltd.', location:'Coimbatore, India',
   body:'Contributed to an autonomous AI-powered developer environment that independently analyzes repositories, implements features and modernizes legacy codebases end-to-end.' },
 { period:'Apr 2025 — May 2025', role:'AI Developer Intern', org:'NetKathir Technologies Pvt. Ltd.', location:'Puducherry, India',
   body:'Developed an AI-powered 3D medical conversational avatar using NLP and real-time speech processing.' },
];
export const recognition = ['Civic Stack Hackathon · IIT Delhi', 'AWS AI for Bharat Hackathon', 'Technova Hackathon', '2nd SmallAI Hackathon'];

export type ToolItem = { name:string; logo?:string; generic?:'database'|'target'|'api'|'network'|'brain' };
export type ToolCategory = { name:string; items:ToolItem[] };
export const toolkit: ToolCategory[] = [
 { name:'Languages', items:[
   { name:'Python', logo:'python' }, { name:'SQL', generic:'database' }, { name:'JavaScript', logo:'javascript' },
   { name:'TypeScript', generic:'api' }, { name:'C++', logo:'cplusplus' }, { name:'HTML', logo:'html5' }, { name:'CSS', logo:'css3' },
 ]},
 { name:'AI & Computer Vision', items:[
   { name:'PyTorch', logo:'pytorch' }, { name:'OpenCV', logo:'opencv' },
   { name:'MediaPipe Holistic', logo:'mediapipe' }, { name:'Hugging Face', logo:'huggingface' },
   { name:'DistilBERT', logo:'huggingface' }, { name:'YOLOv11', generic:'target' }, { name:'RF-DETR', generic:'target' },
   { name:'ONNX', generic:'network' }, { name:'Roboflow', logo:'roboflow' }, { name:'NumPy', generic:'database' }, { name:'Pandas', generic:'database' },
 ]},
 { name:'Generative AI & Agents', items:[
   { name:'AWS Bedrock', generic:'brain' }, { name:'Anthropic Claude', generic:'brain' },
   { name:'Multi-Agent Systems', generic:'network' }, { name:'AST-Based Analysis', generic:'api' },
   { name:'GitNexus', generic:'network' }, { name:'OpenClaw', generic:'brain' },
   { name:'Hermes Agent', generic:'brain' }, { name:'Browser Use', generic:'network' },
 ]},
 { name:'Backend, Web & Data', items:[
   { name:'FastAPI', logo:'fastapi' }, { name:'Node.js', generic:'api' }, { name:'Express.js', generic:'api' },
   { name:'REST APIs', generic:'api' }, { name:'Supabase', logo:'supabase' }, { name:'PostgreSQL', generic:'database' },
   { name:'DynamoDB', generic:'database' }, { name:'React Native', generic:'network' }, { name:'Expo', generic:'api' },
 ]},
 { name:'Cloud & DevOps', items:[
   { name:'AWS Lambda', generic:'network' }, { name:'AWS Step Functions', generic:'network' },
   { name:'Amazon API Gateway', generic:'api' }, { name:'Docker', generic:'network' },
   { name:'Google Cloud', logo:'googlecloud' },
 ]},
 { name:'Tools & Platforms', items:[
   { name:'Git', logo:'git' }, { name:'GitHub', logo:'github' }, { name:'VS Code', logo:'visualstudiocode' },
   { name:'Jupyter', generic:'api' }, { name:'Google Maps', logo:'googlemaps' },
   { name:'Mapbox', generic:'target' }, { name:'Cloudinary', logo:'cloudinary' },
 ]},
];

export const interests = [
 { title:'Agentic developer tools', note:'The pull toward Lazarus — systems that understand a codebase well enough to act on it.' },
 { title:'Computer vision & motion understanding', note:'What the sign-recognition work is built on: reading movement as meaning, frame by frame.' },
 { title:'Cloud AI & backend systems', note:'The infrastructure side of UrbanPulse and VSYK — where a model has to survive real traffic.' },
 { title:'Conversational & speech interfaces', note:'Carried over from the NetKathir internship: making an interface feel like a conversation.' },
 { title:'Explainable & trustworthy AI', note:'Grad-CAM and evidence-first case studies — a model is only useful if you can say why it decided something.' },
];
export const approach = [
 { step:'Understand', body:'Read the problem before the code — what is actually being asked, and what already exists.' },
 { step:'Prototype', body:'Build the smallest version that tests the real risk, not the easiest part first.' },
 { step:'Validate', body:'Check it against evidence — logs, metrics, a second pass — before calling it done.' },
 { step:'Deliver', body:'Ship something documented enough that its limitations are as clear as its results.' },
];
export type Project = { id:string; title:string; category:string; summary:string; tags:string[]; color:string; problem:string; system:string; contribution:string; evidence:string; limitations:string; links:{label:string;url:string}[]; steps:string[] };
const github='https://github.com/kirankishoreV-07/';
export const projects: Project[] = [
{ id:'lazarus',title:'Lazarus',category:'AGENTIC DEVELOPER TOOLS',summary:'Understand the repository. Evaluate the change. Improve the code.',tags:['Agentic AI','Code intelligence','FastAPI'],color:'#b49af5',steps:['Inspect','Plan','Implement','Validate'],problem:'Generated code is only the beginning. Developers also need to understand what a change affects, how it behaves at runtime, and whether it is ready for review.',system:'Lazarus Doctor connects GitHub, indexes a selected repository and updates its context across files, functions, dependencies, changed symbols and affected paths. The deck describes PR Doctor comparing base and PR branches in isolated runs across CPU, memory, latency, throughput, errors and tests, connecting regressions to likely causes. Codebase chat answers architecture and impact questions. Chat-to-change follows request → affected code → impact → plan → developer approval → isolated implementation → tests and benchmarks → PR. Dependency Doctor proposes validated dependency/security updates with approval gates; its daily cadence is a design specification.',contribution:'My resume describes building the Inspector, Architect, Builder, Deployer and Validator pipeline, log-driven recovery workflows, and an AWS-based architecture. This is team work; individual ownership of every Doctor component is not established.',evidence:'Current Doctor: owner-reported implementation using OpenClaw. Earlier public V2: Gemini-based planning and generation, repository scanning, E2B execution and recovery handling. Separate AWS variant: architecture documentation describes Bedrock and AWS services. These are distinct versions, not one verified deployment.',limitations:'Current Doctor/OpenClaw source was not located in the reviewed public sources. The deck names GitNexus, tree-sitter, LadybugDB, NVIDIA NIM/Nemotron, Docker, FastAPI, Next.js, Redis workers, S3 and Secrets Manager; cuGraph is optional. This is architecture evidence, not verification of each integration. No deployed daily scheduler, benchmark speedup, model capacity, OpenShell/NeMo integration or security guarantee is established. Isolation depends on the actual execution environment.',links:[{label:'Public V2 source',url:github+'LAZARUS_AGENTV2'},{label:'AWS architecture',url:github+'LAZARUS_AWS/blob/master/ARCHITECTURE.md'}]},
{ id:'sign-language',title:'SignLink',category:'ACCESSIBLE AI · SIGN-TO-VOICE',summary:'A sign-to-voice communication workspace designed for busy public places.',tags:['PyTorch','MediaPipe Holistic','Accessible AI'],color:'#79cde8',steps:['Sign','Recognize','Staff response','Speak visibly'],problem:'Deaf and signing visitors can face communication barriers at high-footfall gathering and service areas such as transport hubs, hospitals, civic offices, campuses, banks and public venues. Staff need a clear way to understand a signed request and respond without making the visitor depend on an interpreter for every interaction.',system:'SignLink brings the customer and staff into one shared browser workspace. A customer signs at the communication desk; the recognition pipeline interprets a supported phrase and shows the result, confidence and frame-importance context to staff. Staff can type or dictate a reply, then present it as visible text and spoken audio. Place-aware modes tailor desk context for transport, healthcare, civic services, banking, campuses and venues without changing or overriding the model prediction. The recognition experiment uses MediaPipe Holistic landmarks with a spatial GCN and temporal TCN.',contribution:'We designed and built the SignLink product interface and public-service communication flow shown here. My documented technical work includes the landmark pipeline, variance-based node selection, and the spatial and temporal recognition model.',evidence:'The two screens are our SignLink product UI: a public-access landing and service-location selector, plus the live signing and communication desk. The supporting repository reports 94.44% validation accuracy, or 17/18 clips, across six sentence classes from an 86-video dataset.',limitations:'This is a prototype and small six-class validation experiment, not evidence of deployment in public facilities, unseen-signer generalization or unrestricted sign-to-text translation. Recognition is limited to supported phrases. The interface is designed to help staff communicate; it should not make medical, financial or service decisions for the customer.',links:[{label:'Code & experiment',url:github+'Continuous-Sign-Language-Recognition'},{label:'Original demo video',url:github+'Continuous-Sign-Language-Recognition/blob/main/Demo.mp4'}]},
{ id:'urbanpulse',title:'UrbanPulse',category:'MULTIMODAL AI · CIVIC SYSTEMS',summary:'Turning civic reports into clearer priorities.',tags:['Computer vision','NLP','Geospatial'],color:'#9ebc9b',steps:['Report','Understand','Prioritize','Map'],problem:'Civic teams need to connect scattered reports, image evidence and location context to decide which issues deserve attention first.',system:'The resume describes a multimodal platform combining computer vision, urgency/sentiment analysis, geospatial prioritization, and mobile/cloud integration. Later reported capabilities include Sarvam speech-to-text for 11 Indian languages, social ingestion, Grad-CAM explanations and LSTM forecasting over 30/60/90-day horizons.',contribution:'My resume describes building the multimodal monitoring pipeline, geospatial priority engine and forecasting integration.',evidence:'Related CIVIC-REZO repositories contain a mobile frontend, image-analysis integration, DistilBERT emotion-service files, location-priority logic and heatmap services. They provide related implementation evidence, not proof of every later UrbanPulse capability.',limitations:'The related code and resume use different scoring formulas, so no combined set of weights is presented here. Speech languages, forecasting, social ingestion and explainability remain resume-reported. No municipal adoption, forecasting accuracy or resolved-issue count is established. The visual is an illustrative example.',links:[{label:'Related frontend',url:github+'CIVIC-REZO-Frontend'},{label:'Related backend',url:github+'CIVIC-REZO-Backend'}]},
{ id:'vsyk',title:'VSYK Chits',category:'FULL-STACK MOBILE · OPERATIONS',summary:'One platform for members, auctions, and administration.',tags:['React Native','Supabase','TypeScript'],color:'#dec097',steps:['Members','Installments','Auctions','Administration'],problem:'Members and administrators need a coherent way to navigate groups, installments, auction activity and operational records.',system:'The repository describes Expo/React Native member and admin experiences with group browsing, transaction history, live auctions, wallet/payment flows, customer administration, settlements and reporting. Express, Supabase Auth/PostgreSQL/Realtime, Razorpay, TanStack Query and Zustand underpin the stack, with English/Tamil localization.',contribution:'Selected full-stack project from my public repository. Individual component authorship is not documented here; repository ownership is not presented as sole authorship.',evidence:'Source and architecture documentation describe the feature surface. The customer-detail feature audit distinguishes implemented, partial and TODO areas; feature listings alone do not establish end-to-end completion.',limitations:'The audit may reflect an earlier state. No production completeness, real users, payment volume, app-store release or financial compliance is claimed. The portfolio diagram uses no customer or payment data.',links:[{label:'Application source',url:github+'VSYK_APP'},{label:'Feature audit',url:github+'VSYK_APP/blob/main/docs/architecture/FEATURE_AUDIT.md'}]},
{ id:'joulet',title:'Joulet',category:'ENERGY SYSTEMS · CRYPTOGRAPHY',summary:'Verifying energy data before it becomes on-chain value.',tags:['Python','Solidity','Zero-knowledge proofs'],color:'#e2bf6f',steps:['Simulate','Sign','Verify','Record'],problem:'Before energy readings become blockchain records, a verification pipeline needs to check their origin, plausibility and freshness.',system:'Modelica solar readings become ECDSA-signed packets. Three oracle nodes check signatures, capacity, solar hours, rate of change, weather corroboration and replay nonces before consensus and batching. Flask/Python, Redis, Solidity/Hardhat, Merkle proofs and ZoKrates-based capacity proofs support the prototype and dashboard.',contribution:'The team README explicitly credits Kiran Kishore V with Phase 2 signing, Phase 3 oracle work and Phase 6 zero-knowledge proofs. Other phases are team contributions.',evidence:'The public repository documents a simulation-backed pipeline and local Hardhat environment. Oracle source provides implementation evidence for the validation checks.',limitations:'A capacity-bound ZK circuit does not prove all physical laws or real sensor truth. Readings are simulated; prototype carbon NFTs are not certified tradable credits. The README’s transaction-reduction claim is omitted because a documented comparison was not established.',links:[{label:'Team source & credits',url:github+'Joulet'},{label:'Oracle implementation',url:github+'Joulet/blob/main/oracle/oracle_node.py'}]}
];
