/* v397: fanbase groups (see the project doc claude/tksim-fanbase-spec.md).
   Every wrestler belongs to one fan group (a few versatile stars two), shown on their card. v397 is data and display only:
   nothing reads the groups for ratings, fans or money yet (that's v398+).
   Groups: cas Casuals · tech Technical · blood Bloodhounds · flip Flippy · chaos Chaos fiends.
   Real wrestlers are set from their real-life style (Josh approved the list Nov 21, 2026). 'und' = undiscovered: the bottom tier
   of AEW/ROH/WWE starts with no group and will find one through who they work with (v398). Big indie and international stars
   keep their real identities. Anyone not listed (gimmick prospects, created characters) uses the style rule FG_STYLE.
   Keyed by wrestler id (slug of the original name), so a rebrand keeps the group. */
const FG_N={cas:'Casuals',tech:'Technical',blood:'Bloodhounds',flip:'Flippy',chaos:'Chaos fiends',und:'Undiscovered'};
const FG_STYLE={fl:'flip',te:'tech',br:'blood',sh:'chaos',pw:'blood'};
const FG_RAW=`Will Ospreay|flip,tech
Kenny Omega|tech,flip
Jon Moxley|blood
Claudio Castagnoli|tech
Wheeler Yuta|tech
Marina Shafir|tech
MJF|chaos
Hangman Adam Page|blood
Swerve Strickland|flip
Kofi Kingston|flip
Austin Creed|chaos
Darby Allin|flip,blood
Steven Borden|blood
Kyle Fletcher|tech
Ilja Dragunov|blood
Kevin Knight|flip
Konosuke Takeshita|tech
Kazuchika Okada|tech
Andrade El Ídolo|flip
Daniel Garcia|tech
Mark Davis|blood
Jack Perry|flip
Ricochet|flip
Christian Cage|chaos
Adam Copeland|blood
Cash Wheeler|tech
Dax Harwood|tech
Matt Jackson|flip
Nick Jackson|flip
Brody King|blood
Bandido|flip
Gabe Kidd|blood
Chris Jericho|chaos
Orange Cassidy|cas
Kyle O'Reilly|tech
Roderick Strong|tech
Adam Cole|chaos
Mark Briscoe|blood
Tommaso Ciampa|blood
Samoa Joe|tech
Hook|blood
Myron Reed|flip
Wardlow|cas
Josh Alexander|tech
Hechicero|tech
Komander|flip
Mascara Dorada|flip
Lance Archer|blood
Katsuyori Shibata|tech
Jay White|chaos
Eddie Kingston|blood
Lio Rush|flip
Mike Bailey|flip
Francesco Akira|flip
Bobby Lashley|cas
Shelton Benjamin|tech
Místico|flip
Tomohiro Ishii|blood
Brian Cage|cas
Ace Austin|flip
Juice Robinson|blood
Austin Gunn|chaos
Colten Gunn|chaos
David Finlay|blood
Clark Connors|blood
Bishop Kaun|blood
Toa Liona|blood
Dezmond Xavier|flip
Kota Ibushi|flip
Hologram|flip
Mercedes Moné|cas
Thekla|chaos
Willow Nightingale|cas
Jamie Hayter|blood
Alex Windsor|tech
Megan Bayne|blood
Lena Kross|blood
Persephone|tech
Maya World|chaos
Harley Cameron|chaos
Toni Storm|chaos
Kris Statlander|tech
Hikaru Shida|tech
Julia Hart|chaos
Skye Blue|flip
Athena|blood
Anna Jay|tech
Mina Shirakawa|tech
Riho|flip
Queen Aminata|blood
Thunder Rosa|blood
Serena Deeb|tech
Penelope Ford|flip
Britt Baker|cas
Dani Luna|tech
Hyan|tech
Deonna Purrazzo|tech
Yuka Sakazaki|flip
Taya Valkyrie|blood
Sammy Guevara|flip
Dustin Rhodes|blood
MVP|chaos
Rush|blood
Dralístico|flip
Nick Wayne|flip
Action Andretti|flip
Alex Shelley|tech
Chris Sabin|flip
Buddy Matthews|blood
The Beast Mortos|flip
Blake Christian|flip
Lee Moriarty|tech
Anthony Bowens|cas
Billy Gunn|chaos
Rocky Romero|tech
Trent Beretta|tech
John Silver|blood
Preston Vance|blood
Lee Johnson|flip
Jake Doyle|cas
El Clon|tech
Luchasaurus|blood
Johnny TV|chaos
Mansoor|tech
Mason Madden|blood
AR Fox|flip
Anthony Ogogo|und
Angelo Parker|chaos
Michael Nakazawa|chaos
Peter Avalon|und
Shane Taylor|blood
Tommy Billington|flip
Truth Magnum|chaos
Turbo Floyd|chaos
Zachary Wentz|flip
Ruby Soho|blood
Kamille|und
Red Velvet|flip
Cassie Lee|chaos
Jessie McKay|chaos
Charlette Renegade|und
Robyn Renegade|und
Leila Grey|und
Mara Sadè|chaos
Tatevik|und
Bryan Keith|blood
Zayda Steel|chaos
Billie Starkz|flip
Jay Lethal|tech
Tony Nese|flip
Angelico|und
Evil Uno|chaos
Alex Reynolds|tech
Matt Sydal|flip
Dante Martin|flip
Darius Martin|flip
Griff Garrison|und
Cole Karter|und
Zack Gibson|tech
James Drake|blood
Aaron Solo|und
Alec Price|flip
Anthony Henry|und
Ariya Daivari|und
Carlie Bravo|und
Jordan Oliver|flip
Josh Woods|tech
Marshall Von Erich|und
Ross Von Erich|blood
Matt Menard|chaos
Mike Bennett|und
Nick Comoroto|und
Ortiz|blood
Satnam Singh|cas
Scorpio Sky|tech
Serpentico|und
Shawn Dean|und
Diamanté|blood
Rachel Ellering|und
Dalton Castle|und
QT Marshall|und
Adam Priest|und
Big Boom! A.J.|und
Jacked Jameson|und
JD Drake|und
Myles Hawkins|und
Isiah Kassidy|und
Marq Quen|und
Lacey Lane|und
VertVixen|und
Viva Van|und
Christyan XO|und
Trish Adora|und
Isla Dawn|und
Roman Reigns|cas
Jey Uso|cas
Jimmy Uso|cas
Jacob Fatu|blood
Solo Sikoa|chaos
Seth Rollins|tech
Bron Breakker|chaos
Bronson Reed|cas
Austin Theory|chaos
Logan Paul|chaos
LA Knight|cas
Oba Femi|cas
Penta|flip
Je'Von Evans|flip
Dominik Mysterio|chaos
JD McDonagh|tech
Rey Mysterio|flip
Dragon Lee|flip
Cruz Del Toro|flip
Joaquin Wilde|und
Chad Gable|tech
El Grande Americano|chaos
Joe Hendry|cas
Ethan Page|chaos
Rusev|blood
Otis|cas
Akira Tozawa|flip
Big Cass|chaos
Julius Creed|tech
Brutus Creed|tech
Royce Keys|cas
Bronco Nima|und
Lucien Price|und
Montez Ford|flip
Angelo Dawkins|tech
Cody Rhodes|cas
CM Punk|tech,chaos
Sami Zayn|tech
Randy Orton|tech
Gunther|tech
Drew McIntyre|blood
Kevin Owens|chaos
Damian Priest|blood
Finn Bálor|tech
The Miz|chaos
R-Truth|cas
Shinsuke Nakamura|tech
Kyoki|blood
Johnny Gargano|tech
Carmelo Hayes|flip
Trick Williams|cas
Ricky Saints|chaos
Rey Fenix|flip
Axiom|flip
Nathan Frazer|flip
Baron Corbin|cas
Tama Tonga|blood
Talla Tonga|blood
Erik|blood
Ivar|flip
Kit Wilson|chaos
Elton Prince|chaos
Matt Cardona|blood
Danhausen|chaos
Becky Lynch|blood
Liv Morgan|chaos
Stephanie Vaquer|flip
IYO SKY|flip
Asuka|tech
Bayley|tech
Lyra Valkyria|tech
Raquel Rodriguez|cas
Roxanne Perez|tech
Sol Ruca|flip
Lola Vice|blood
Ivy Nile|tech
Jaida Parker|blood
Maxxine Dupri|cas
Naomi|flip
Charlotte Flair|tech
Tiffany Stratton|flip
Jade Cargill|cas
Bianca Belair|tech
Rhea Ripley|blood
Nia Jax|cas
Alexa Bliss|chaos
Chelsea Green|chaos
Giulia|blood
Jordynne Grace|blood
Nikki Bella|cas
Brie Bella|cas
Paige|tech
Blake Monroe|chaos
Lash Legend|cas
Michin|blood
B-Fab|chaos
Candice LeRae|tech
Tatum Paxley|chaos
Fallon Henley|blood
Jacy Jayne|chaos
Lainey Reid|blood
Kiana James|chaos
Piper Niven|blood
Leon Slater|flip
Nic Nemeth|tech
Frankie Kazarian|tech
Mance Warner|blood
Mustafa Ali|flip
EFFY|blood
Bear Bronson|blood
Moose|cas
Krule|blood
1 Called Manders|blood
Matt Riddle|tech
Joey Janela|blood
Joshua Bishop|blood
Kerry Morton|chaos
Trevor Lee|flip
Eddie Edwards|tech
Gringo Loco|flip
Alex Kane|tech
Rich Swann|flip
Daga|blood
Masha Slamovich|blood
Steph De Lander|blood
Jody Threat|blood
Man Like DeReiss|flip
Michael Oku|flip
Luke Jacobs|blood
Robbie X|flip
Ricky Knight Jr.|blood
Kidd Bandit|flip
Session Moth Martina|chaos
Yota Tsuji|tech
Zack Sabre Jr.|tech
Yoshiki Inamura|tech
KENTA|chaos
El Desperado|tech
Shota Umino|blood
Oleg Boltin|tech
Yuya Uemura|tech
Shingo Takagi|blood
Kenoh|blood
Kaito Kiyomiya|tech
Saya Kamitani|flip
Sareee|blood
Momo Watanabe|blood
Starlight Kid|flip
AZM|flip
Miyu Yamashita|blood
Templario|flip
Laredo Kid|flip
Averno|tech
Atlantis Jr.|flip
Titán|flip
Volador Jr.|flip
Galeno del Mal|blood
Bárbaro Cavernario|blood
Lady Flammer|flip
Zeuxis|blood
Dalys|cas`;
let FG=null;
function fgMap(){if(FG)return FG;FG={};FG_RAW.trim().split('\n').forEach(l=>{const [n,g]=l.split('|');FG[slug(n.trim())]=g.split(',')});return FG}
/* groups for a wrestler: ['blood'], ['flip','tech'] or ['und'] */
function fgOf(w){if(!w)return [];const g=fgMap()[w.id];if(g)return g;return [FG_STYLE[w.st]||'cas']}
function fgUnd(w){return fgOf(w)[0]==='und'}
/* the words on a card or profile: "Bloodhounds", "Flippy · Technical", "Undiscovered" */
function fgWord(w){return fgOf(w).map(g=>FG_N[g]).join(' · ')}
function fgTag(w,cls){const g=fgOf(w);return `<span class="fgw ${cls||''}">${g.map(k=>`<i class="fg-${k}">${FG_N[k]}</i>`).join('<b>·</b>')}</span>`}
window.fgOf=fgOf;window.fgUnd=fgUnd;window.fgWord=fgWord;window.fgTag=fgTag;
(function(){const s=document.createElement('style');s.textContent=`
.fgw{font:800 italic 1em/1 'BC',sans-serif;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap}.fgw b{margin:0 .3em;color:#8a8580;font-weight:700}
.fg-cas{color:#efe9dc}.fg-tech{color:#7fa7d6}.fg-blood{color:#e5484d}.fg-flip{color:#3fc8b4}.fg-chaos{color:#b77ee8}.fg-und{color:#9a958c}
.tkc .tcfg{display:block;margin-bottom:calc(var(--w)*.025);font-size:calc(var(--w)*.085);overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 0 #000,0 0 6px rgba(0,0,0,.9)}
.tcs .tcmat.many .tkc .tcfg,.tlrow .tkc .tcfg,.twcd .tkc .tcfg{display:none}
`;document.head.appendChild(s)})();
