import {useState} from 'react'
import {motion} from 'framer-motion'
import {Users,Send,RotateCcw,Loader2,AlertCircle,CheckCircle} from 'lucide-react'

interface FormData{
job_title: string;
company: string;
skills: string;
country: string;
}

const initialFormData: FormData = {
job_title: 'Software Engineer',
company: 'Tech Corp',
skills: 'Python, Machine Learning, Data Analysis',
country: 'USA'
}

const clusters = [
{id:0,name:'Traditional Statistical Analysis (SAS/R)',skills:'SQL, R, Excel, SAS, Go'},
{id:1,name:'Enterprise Operations & VBA Automation',skills:'Excel, SQL, SAP, Word, VBA'},
{id:2,name:'Multi-Cloud Infrastructure & DevOps',skills:'Azure, AWS, Python, SQL, Linux'},
{id:3,name:'Cloud Data Warehousing (Snowflake)',skills:'Snowflake, SQL, Python, AWS, Azure'},
{id:4,name:'Cross-Platform Cloud Solutions',skills:'Azure, SQL, Python, AWS, GCP'},
{id:5,name:'Containerization & Cloud Orchestration',skills:'Python, Docker, Kubernetes, AWS, SQL'},
{id:6,name:'Business Intelligence & SAP Reporting',skills:'SQL, Excel, Tableau, Python, SAP'},
{id:7,name:'Full-Stack Development & Backend',skills:'Python, SQL, Java, JavaScript, AWS'},
{id:8,name:'Advanced Analytics & SAS Visualization',skills:'Python, SQL, R, SAS, Tableau'},
{id:9,name:'NoSQL & Modern Database Management',skills:'NoSQL, SQL, Python, AWS, MongoDB'},
{id:10,name:'Oracle & Enterprise Database Systems',skills:'SQL, SAP, SAS, Go, Oracle'},
{id:11,name:'Power BI & Excel Reporting',skills:'Power BI, SQL, Excel, Python'},
{id:12,name:'Big Data Streaming & Kafka',skills:'Kafka, Spark, Python, SQL, Hadoop'},
{id:13,name:'Interactive Dashboarding (Power BI/Tableau)',skills:'Power BI, Tableau, SQL, Python'},
{id:14,name:'Databricks & Spark Data Engineering',skills:'Databricks, Azure, SQL, Python, Spark'},
{id:15,name:'AWS Redshift & Data Pipelines',skills:'Redshift, AWS, SQL, Python, Spark'},
{id:16,name:'Pythonic Data Science (Pandas/NumPy)',skills:'Pandas, Python, NumPy, SQL, Scikit-learn'},
{id:17,name:'Core Data Analysis (Python/R)',skills:'Python, SQL, R, Excel, SAS'},
{id:18,name:'Distributed Computing & Hadoop',skills:'Python, Spark, SQL, Hadoop, R'},
{id:19,name:'Deep Learning & Cloud AI',skills:'Python, PyTorch, TensorFlow, SQL, AWS'},
{id:20,name:'Academic & Research Computing (Matlab/SAS)',skills:'Python, R, SAS, Matlab, Java'},
{id:21,name:'Enterprise Cloud Development (Java/AWS)',skills:'SQL, Python, AWS, Java, Oracle'},
{id:22,name:'Tableau Focused Data Visualization',skills:'Tableau, SQL, Python, Excel, R'},
{id:23,name:'Machine Learning Engineering (TF/Pytorch)',skills:'TensorFlow, Python, PyTorch, SQL, R'},
{id:24,name:'General Office & Business Productivity',skills:'Excel, PowerPoint, Word, SQL, Python'}
]

export default function MLClustering(){
const[f,setF]=useState(initialFormData)
const[l,setL]=useState(false)
const[r,setR]=useState<number|null>(null)
const[e,setE]=useState<string|null>(null)
const u=(k:keyof FormData,v:any)=>{setF(p=>({...p,[k]:v}));setE(null)}
const submit=async()=>{
setL(true);setR(null);setE(null)
try{
const res=await fetch('http://127.0.0.1:8000/ilyes_clustering/predict',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)})
if(!res.ok){
const err=await res.json()
throw new Error(err.detail || 'Backend error')
}
const d=await res.json()
setR(d.cluster)
}catch(e){setE((e as Error).message || 'Backend error')}
setL(false)
}
return(
<div className="space-y-6">
<div className="space-y-4">
<div className="grid grid-cols-1 gap-4">
<div className="space-y-2"><label className="text-sm font-medium">Job Title</label><input className="input-field w-full" type="text" value={f.job_title} onChange={e=>u('job_title',e.target.value)}/></div>
<div className="space-y-2"><label className="text-sm font-medium">Company</label><input className="input-field w-full" type="text" value={f.company} onChange={e=>u('company',e.target.value)}/></div>
<div className="space-y-2"><label className="text-sm font-medium">Skills</label><textarea className="input-field w-full" rows={3} value={f.skills} onChange={e=>u('skills',e.target.value)}/></div>
<div className="space-y-2"><label className="text-sm font-medium">Country</label><input className="input-field w-full" type="text" value={f.country} onChange={e=>u('country',e.target.value)}/></div>
</div>
</div>
<div className="flex gap-3">
<button onClick={submit} disabled={l} className="btn-primary flex items-center gap-2">
{l?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4"/>}
Predict
</button>
<button onClick={()=>setF(initialFormData)} className="btn-secondary flex items-center gap-2">
<RotateCcw className="w-4 h-4"/>
Reset
</button>
</div>
{r!==null&&(
<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="p-4 rounded-lg border bg-card">
<div className="flex items-center gap-3">
<CheckCircle className="w-5 h-5 text-green-500"/>
<div>
<h3 className="font-medium">Clustering Result</h3>
<p className="text-sm text-muted-foreground">This job belongs to cluster: <span className="font-semibold">{clusters.find(c=>c.id===r)?.name||'Unknown'}</span></p>
<p className="text-sm text-muted-foreground">Top Associated Skills: <span className="font-semibold">{clusters.find(c=>c.id===r)?.skills||'N/A'}</span></p>
</div>
</div>
</motion.div>
)}
{e&&(
<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="p-4 rounded-lg border border-destructive bg-destructive/10">
<div className="flex items-center gap-3">
<AlertCircle className="w-5 h-5 text-destructive"/>
<div>
<h3 className="font-medium">Error</h3>
<p className="text-sm text-muted-foreground">{e}</p>
</div>
</div>
</motion.div>
)}
</div>
)
}

export const mlClusteringConfig={id:'clustering',title:'Job Clustering',description:'Cluster jobs based on features',icon:Users,component:MLClustering,disabled:false}