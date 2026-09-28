// Foundry composition; anidoodle performs and synthesizes every note.
import {line} from '@anidoodle/music/plan';
import {renderPiece} from '@anidoodle/music/render';
export function score(){
 const sections=[{id:'press',bars:2,mood:'curious',key:'D',mode:'major',melody:['ostinato'],dyn:[.34,.5]},{id:'answer',bars:4,mood:'hopeful',key:'D',mode:'major',melody:['callResponse'],dyn:[.46,.72]},{id:'garden',bars:4,mood:'joy',key:'D',mode:'major',melody:['themeTransformation'],dyn:[.68,.42]}];
 const melody='D5:.5 A5:.5 F#5:1 E5:1 D5:1 | D5:.5 A5:.5 F#5:1 E5:1 A4:1 | D5:1 F#5:1 A5:1 B5:1 | A5:1 F#5:1 E5:1 D5:1 | E5:1 G5:1 B5:1 A5:1 | F#5:1 E5:1 D5:2 | D5:.5 A5:.5 F#5:1 E5:1 F#5:1 | G5:1 B5:1 A5:2 | F#5:1 E5:1 C#5:1 E5:1 | D5:4';
 return {title:'A line learns to breathe',seed:1818,tail:3,plan:{style:'folk',tempo:84,meter:'4/4',sections,phraseBars:2,rubato:.3,ritard:.86},parts:[{id:'mechanism',inst:'marimba',role:'accomp',gainDb:-9,opts:{grid:true},notes:line(0,'D3:1 A3:1 D4:1 A3:1 | D3:1 A3:1 D4:1 A3:1 | G3:2 D4:2 | A3:2 E4:2 | G3:2 D4:2 | D3:2 A3:2 | D3:2 A3:2 | G3:2 D4:2 | A3:2 E4:2 | D3:4',{role:'accomp',bpb:4,v:.45})},{id:'living-answer',inst:'harp',role:'melody',gainDb:-2,notes:line(4,melody.split('|').slice(1).join('|'),{role:'melody',bpb:4,v:.7})}],harmony:[{t:0,name:'D'},{t:8,name:'G'},{t:12,name:'D'},{t:16,name:'Em'},{t:20,name:'D'},{t:24,name:'D'},{t:28,name:'G'},{t:32,name:'A'},{t:36,name:'D'}]};
}
export const renderScore=()=>renderPiece(score(),24000,{seconds:33,expressive:true,master:'gentle'});
