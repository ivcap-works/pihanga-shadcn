import{t as e}from"./arc-ue6n6yJN.js";import{An as t,Kn as n,Mt as r,Nn as i,P as a,Xt as o,_n as s,_t as c,bn as l,gn as u,hn as d,jn as f,jt as p,k as m,mt as h,pn as g,qn as _,un as v,yn as y}from"./index-BQPQvysA.js";import{t as b}from"./mermaid-parser.core-BEdtkymH.js";import{t as x}from"./chunk-4BX2VUAB-3m6MNgbV.js";function S(e,t){return t<e?-1:t>e?1:t>=e?0:NaN}function C(e){return e}function w(){var e=C,t=S,n=null,i=r(0),a=r(p),o=r(0);function s(r){var s,l=(r=c(r)).length,u,d,f=0,m=Array(l),h=Array(l),g=+i.apply(this,arguments),_=Math.min(p,Math.max(-p,a.apply(this,arguments)-g)),v,y=Math.min(Math.abs(_)/l,o.apply(this,arguments)),b=y*(_<0?-1:1),x;for(s=0;s<l;++s)(x=h[m[s]=s]=+e(r[s],s,r))>0&&(f+=x);for(t==null?n!=null&&m.sort(function(e,t){return n(r[e],r[t])}):m.sort(function(e,n){return t(h[e],h[n])}),s=0,d=f?(_-l*b)/f:0;s<l;++s,g=v)u=m[s],x=h[u],v=g+(x>0?x*d:0)+b,h[u]={data:r[u],index:s,value:x,startAngle:g,endAngle:v,padAngle:y};return h}return s.value=function(t){return arguments.length?(e=typeof t==`function`?t:r(+t),s):e},s.sortValues=function(e){return arguments.length?(t=e,n=null,s):t},s.sort=function(e){return arguments.length?(n=e,t=null,s):n},s.startAngle=function(e){return arguments.length?(i=typeof e==`function`?e:r(+e),s):i},s.endAngle=function(e){return arguments.length?(a=typeof e==`function`?e:r(+e),s):a},s.padAngle=function(e){return arguments.length?(o=typeof e==`function`?e:r(+e),s):o},s}var T=d.pie,E={sections:new Map,showData:!1,config:T},D=E.sections,O=E.showData,k=structuredClone(T),A={getConfig:n(()=>structuredClone(k),`getConfig`),clear:n(()=>{D=new Map,O=E.showData,v()},`clear`),setDiagramTitle:i,getDiagramTitle:l,setAccTitle:f,getAccTitle:s,setAccDescription:t,getAccDescription:u,addSection:n(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);D.has(e)||(D.set(e,t),_.debug(`added new section: ${e}, with value: ${t}`))},`addSection`),getSections:n(()=>D,`getSections`),setShowData:n(e=>{O=e},`setShowData`),getShowData:n(()=>O,`getShowData`)},j=n((e,t)=>{x(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},`populateDb`),M={parse:n(async e=>{let t=await b(`pie`,e);_.debug(t),j(t,A)},`parse`)},N=n(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,`getStyles`),P=n(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),n=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return w().value(e=>e.value).sort(null)(n)},`createPieArcs`),F={parser:M,db:A,renderer:{draw:n((t,n,r,i)=>{_.debug(`rendering pie chart
`+t);let s=i.db,c=y(),l=m(s.getConfig(),c.pie),u=h(n),d=u.append(`g`);d.attr(`transform`,`translate(225,225)`);let{themeVariables:f}=c,[p]=a(f.pieOuterStrokeWidth);p??=2;let v=l.textPosition,b=e().innerRadius(0).outerRadius(185),x=e().innerRadius(185*v).outerRadius(185*v);d.append(`circle`).attr(`cx`,0).attr(`cy`,0).attr(`r`,185+p/2).attr(`class`,`pieOuterCircle`);let S=s.getSections(),C=P(S),w=[f.pie1,f.pie2,f.pie3,f.pie4,f.pie5,f.pie6,f.pie7,f.pie8,f.pie9,f.pie10,f.pie11,f.pie12],T=0;S.forEach(e=>{T+=e});let E=C.filter(e=>(e.data.value/T*100).toFixed(0)!==`0`),D=o(w).domain([...S.keys()]);d.selectAll(`mySlices`).data(E).enter().append(`path`).attr(`d`,b).attr(`fill`,e=>D(e.data.label)).attr(`class`,`pieCircle`),d.selectAll(`mySlices`).data(E).enter().append(`text`).text(e=>(e.data.value/T*100).toFixed(0)+`%`).attr(`transform`,e=>`translate(`+x.centroid(e)+`)`).style(`text-anchor`,`middle`).attr(`class`,`slice`);let O=d.append(`text`).text(s.getDiagramTitle()).attr(`x`,0).attr(`y`,-400/2).attr(`class`,`pieTitleText`),k=[...S.entries()].map(([e,t])=>({label:e,value:t})),A=d.selectAll(`.legend`).data(k).enter().append(`g`).attr(`class`,`legend`).attr(`transform`,(e,t)=>{let n=22*k.length/2;return`translate(216,`+(t*22-n)+`)`});A.append(`rect`).attr(`width`,18).attr(`height`,18).style(`fill`,e=>D(e.label)).style(`stroke`,e=>D(e.label)),A.append(`text`).attr(`x`,22).attr(`y`,14).text(e=>s.getShowData()?`${e.label} [${e.value}]`:e.label);let j=512+Math.max(...A.selectAll(`text`).nodes().map(e=>e?.getBoundingClientRect().width??0)),M=O.node()?.getBoundingClientRect().width??0,N=450/2-M/2,F=450/2+M/2,I=Math.min(0,N),L=Math.max(j,F)-I;u.attr(`viewBox`,`${I} 0 ${L} 450`),g(u,450,L,l.useMaxWidth)},`draw`)},styles:N};export{F as diagram};