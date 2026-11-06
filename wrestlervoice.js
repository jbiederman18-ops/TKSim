/* Original promo lines for the game's versions of roster wrestlers. Each line
   stands on its own in a fresh save: no assumed wins, losses, or past feuds. */
'use strict';
(function(){
const VOICE={
 'MJF':{
  hold:"Salt of the Earth",
  near:"a Double Cross",
  finish:"Heat Seeker",
  accept:"Fine. You get one match. I get one more example to point to the next time somebody asks why I'm paid what I'm paid.",
  challenge:"You want the biggest match of your career, {B}? Good news. I'm offering. Bad news. You've got to wrestle me. Say yes.",
  ambition:"Look at the name on your ticket. Look at the name at the top of the card. If they're different, somebody in the office owes you an explanation.",
  answer:"Cute. You rehearsed that for the people in the cheap seats. Try impressing somebody who didn't pay to agree with you."},
 'CM Punk':{
  hold:"the Anaconda Vise",
  near:"a running knee in the corner",
  accept:"Yeah. I'll be there. Take a good look at me now, because the next time you see me you'll have to do something about it.",
  challenge:"Look at me when you answer, {B}. I'm asking for one match. You can tell everybody what you're made of right here, or you can show me in there.",
  ambition:"I know exactly how this goes. Somebody tells me to wait my turn. Then the bell rings and we find out why they wanted me to wait.",
  answer:"You know what? I used to care what people like you said about me. Then I found out most of them had never been in the ring with me.",
  finish:'Go to Sleep'},
 'Hangman Adam Page':{
  near:"a Dead Eye",
  accept:"All right. I'll be there. And when that bell goes, I don't want either of us wondering what would happen if we went a little harder.",
  challenge:"I've been trying to find a decent way to say this, {B}. There isn't one. I want to find out if I can beat you. Give me the match.",
  ambition:"I've talked myself out of a lot of things I wanted. I'm done doing that. I want the top spot, and whoever's standing there can look me in the eye.",
  answer:"Maybe you're right about me. I've asked myself worse. You still have to stand across that ring when the bell goes.",
  finish:'Buckshot Lariat'},
 'Swerve Strickland':{
  near:"a House Call",
  accept:"You got it. Now take a minute and think about what you just got yourself into.",
  challenge:"Hold that thought, {B}. Picture the ring when the music stops and you're looking right at me. Still want to talk? Say yes.",
  ambition:"Watch where the camera goes when I walk in. Nobody has to tell it where to look. The rest of the card will catch up.",
  answer:"Keep that same voice when the bell rings. I want to hear how it sounds when you're the one looking for space.",
  finish:'Big Pressure'},
 'Jon Moxley':{
  hold:"a bulldog choke",
  accept:"Yeah. I'll be there. I was starting to think you'd never ask.",
  challenge:"One match, {B}. No speeches. Look me in the eye and tell me you'll be there.",
  ambition:"Give me whoever you were saving for the main event. I'll meet them in the ring. If they're still standing when it's over, we can talk about the spot.",
  answer:"You can say it again if you want. It won't change how the first one feels.",
  finish:'Death Rider'},
 'Will Ospreay':{
  near:"an OsCutter",
  accept:"Yeah, bruv. Let's go. I want to see what you've got when we're ten minutes in and there's no getting your breath back.",
  challenge:"Come on, bruv. One bell, one match. Give me a yes and we'll find out which one of us can keep up.",
  ambition:"I want the slot where everybody's watching, bruv. Put the best you've got in front of me and give me enough time to show you why.",
  answer:"All right, bruv. Save a bit of breath for the match. You're gonna need it when I pick up the pace.",
  finish:'Storm Breaker'},
 'Toni Storm':{
  near:"a running hip attack",
  accept:"Oh, let's. I'll tell wardrobe to make something I can bleed in.",
  challenge:"Darling, you've been hovering in the wings long enough. One match with me. Say yes before they give your part away.",
  ambition:"The trouble with this show is that everybody thinks they're the star. Somebody move that camera a little closer and we'll settle it.",
  answer:"What a delicious little speech. Tell me, darling, do you have anything for the second act?",
  finish:'Storm Zero'},
 'Mercedes Moné':{
  hold:"the Statement Maker",
  near:"a backstabber",
  finish:"Moné Maker",
  accept:"You've got your match. Don't waste it. I don't put my name on just anything.",
  challenge:"You want my time, {B}? One match. When that bell rings, we'll see what you can do with the biggest opportunity you've had.",
  ambition:"I know what my name is worth. Put it at the top of the card and watch how fast everybody else starts calling it the main event.",
  answer:"You got my attention for free. That was your discount. Next time, you earn it in the ring."},
 'Cody Rhodes':{
  near:"a Cody Cutter",
  accept:"Yes. And I hope you remember what it feels like to ask for a match and get it. I'll remember what it felt like to give you one.",
  challenge:"I could spend ten minutes telling these people what this match means to me, {B}. I think they'd rather hear one word from you. Will you wrestle me?",
  ambition:"There's a kid out there holding a sign with my name on it. I want to be in the last match that kid sees tonight, and I want to earn it the hard way.",
  answer:"You can have your opinion of me. These people can have theirs. When the bell rings, I'll give all of you something to judge for yourselves.",
  finish:'Cross Rhodes'},
 'Roman Reigns':{
  near:"a Superman Punch",
  accept:"Fine. You've got my attention. In that ring you'll find out what it costs.",
  challenge:"I made time for you, {B}. One match. Look at me and tell me you're ready for it.",
  ambition:"When I come through that curtain, everybody stands up. Give me the last match and let them see why.",
  answer:"I heard you. So did everybody else. Now you've got to live up to it.",
  finish:'Spear'},
 'Rhea Ripley':{
  hold:"the Prism Trap",
  near:"a big boot",
  finish:"Riptide",
  accept:"Yeah. You've got me. Look me in the eye and tell me you still think this was a good idea.",
  challenge:"You wanted me looking your way, {B}. Here I am. One match. Still feel like saying yes?",
  ambition:"I'm going straight through the person they put on last. If they've got a problem with that, they know exactly where to find me.",
  answer:"That's a big voice you've got from over there. Bring it with you when the bell rings."},
 'Seth Rollins':{
  finish:"Stomp",
  accept:"Oh, you've got a match. Give them a second to enjoy that. The next time they see us, one of us is leaving to the other one's music.",
  challenge:"Let's see what happens when the music stops, {B}. One match. Say yes and give them a reason to keep singing.",
  ambition:"Let the whole show go on before me. Give them every reason to go home. Then hit my music and see how many of them get up.",
  answer:"Oh, that was almost good enough to get stuck in my head. Come back when you've got a second verse."},
 'Becky Lynch':{
  hold:"the Dis-arm-her",
  near:"a Becksploder",
  finish:"Manhandle Slam",
  accept:"You're on. I was beginning to think I'd have to do the asking and the fighting.",
  challenge:"I've got time for a fight, {B}. I haven't got time to hear why you're thinking about one. Say yes and get on with it.",
  ambition:"I know what happens when I wait for somebody to hand me the spot. They find somebody taller to stand in it. I'll take it myself.",
  answer:"That's grand. If talking me out of a fight was that easy, I'd have had a much quieter career."},
 'Kenny Omega':{
  near:"a V-Trigger",
  accept:"All right. You wanted the match. I wanted to see what you'd do if you got it. I guess we both get what we want.",
  challenge:"I could try to explain why this match has been on my mind, {B}. Or you could say yes and we could make something worth explaining.",
  ambition:"Give me the best wrestler you have and enough time to find out who breaks first. That's the last match I want this place to remember.",
  answer:"That's the version of me you've got figured out? Good. I was getting worried you'd actually watched the tape.",
  finish:'One-Winged Angel'},
 'Gunther':{
  hold:"a sleeper hold",
  finish:"Powerbomb",
  accept:"I accept. Prepare for the match you asked for. I intend to give you all of it.",
  challenge:"You want to be taken seriously, {B}? Agree to the match. Once the bell rings, I will give you every opportunity to show me why.",
  ambition:"Give the last match to the wrestler who can keep the entire building watching once the bell rings. I will make that a simple decision.",
  answer:"You have spent a great deal of time describing how good you are. I would prefer to see it."},
 "Adam Copeland":{
  finish:"Spear",
  challenge:"I've walked away from this ring before. I know exactly what it costs to get back to it. Are you willing to find out what one match costs you, {B}?",
  ambition:"I fought too hard to get back here to ask for a nice spot in the middle. Put me in last and see what I still have left.",
  answer:"You know how many people told me it was over? A better speech than yours wouldn't have stopped me either.",
  accept:"All right. But when you see me in that corner, remember whose idea this was."},
 "Darby Allin":{
  near:"a Code Red",
  finish:"Coffin Drop",
  challenge:"I'll meet you in the ring, {B}. I don't care what I look like when I leave. Do you?",
  ambition:"Put me last. If I have to limp back through the curtain, at least I'll know I gave them something to stay for.",
  answer:"You keep telling me what I'm risking. I knew that before I walked out.",
  accept:"Yeah. You can pick how hard we go. I'm just going to go harder."},
 "Kazuchika Okada":{
  near:"a picture-perfect dropkick",
  finish:"Rainmaker",
  challenge:"You want my best, {B}? Good. One match. Please don't make me wait for you to catch up.",
  ambition:"Everybody here wants the main event. I understand. Everybody wants to be me for a night.",
  answer:"You said that so confidently. I almost wish you were right.",
  accept:"Fine. It would be rude to make you ask twice."},
 "Matt Jackson":{
  finish:"Superkick",
  challenge:"Let's do this, {B}. One match. You can spend the rest of the night telling your friends you were on the good part of the show.",
  ambition:"Go ahead and put my match on first. The problem is everything you're going to have to put on after it.",
  answer:"I can hear the crowd, {B}. Can you hear them? That was the part where they were supposed to agree with you.",
  accept:"Absolutely. Do me one favor. Look into the hard camera before the bell and say you're sure."},
 "Nick Jackson":{
  finish:"450 Splash",
  challenge:"You want to find out what happens when I stop messing around, {B}? One match. I'll give you the whole thing.",
  ambition:"Give me the last match and somebody who can keep pace. I don't want to spend the whole night warming up.",
  answer:"That's a lot of words for somebody who still has to catch me.",
  accept:"I'm in. Try to keep track of which rope I'm on."},
 "Orange Cassidy":{
  near:"a Beach Break",
  finish:"Orange Punch",
  challenge:"Hey, {B}. You and me in a match? If you want. I brought my gear.",
  ambition:"I heard the last match is open. I'm already here. Seems easier than calling somebody else.",
  answer:"Okay. Are you done with the microphone?",
  accept:"Sure. I was probably gonna be here anyway."},
 "Christian Cage":{
  finish:"Killswitch",
  challenge:"I'm offering you an education, {B}. One match with me. We can skip the lecture if you're willing to learn the hard way.",
  ambition:"I want the top spot because this company should look like it knows who's in charge.",
  answer:"Keep talking. Every second you spend trying to impress me makes this a little more embarrassing for you.",
  accept:"Of course. Some lessons you don't get to learn for free."},
 "Chris Jericho":{
  finish:"Judas Effect",
  challenge:"Everybody wants to tell me my time is up. You're the first one tonight I'm willing to let try and prove it, {B}. What do you say?",
  ambition:"I've heard the speech about making way for the next big thing. Give that person the last match with me and see how the speech sounds afterward.",
  answer:"I remember being that sure of myself. The difference is I was already getting results.",
  accept:"You're on. Pay attention. There's a reason you wanted this match in the first place."},
 "Adam Cole":{
  finish:"Boom Knee",
  challenge:"You've seen me take over a building, {B}. I want to see what happens when you're close enough to hear it. One match.",
  ambition:"Give me the last match. I want the people all the way at the top saying my name on their way out.",
  answer:"You can have this little moment. I'm after the one they replay tomorrow.",
  accept:"Yeah. And when this place gets loud, keep looking at me."},
 "Kyle Fletcher":{
  finish:"Sheerdrop Brainbuster",
  challenge:"You think I'm in a hurry, {B}? I am. Say yes so I can stop waiting for people to catch up.",
  ambition:"I'm tired of hearing what I'll be in five years. Give me the last match tonight and tell me what year you think it is then.",
  answer:"Keep calling it potential. It lets you pretend you don't have to deal with me yet.",
  accept:"Done. I don't need a dress rehearsal for somebody I'm ready to pass."},
 "Andrade El Ídolo":{
  finish:"The Message",
  challenge:"One match, {B}. You talk like you're ready for it. I want to see what your feet do when the bell rings.",
  ambition:"Look at me. Give me the biggest match you have. I know what to do with it.",
  answer:"Tranquilo. Take your time. I already know how this ends in the ring.",
  accept:"Sí. I hope you look this comfortable when it's just us and a referee."},
 "Samoa Joe":{
  hold:"the Coquina Clutch",
  finish:"Muscle Buster",
  challenge:"There comes a point where a sensible person stops asking for trouble, {B}. I'm curious if you've reached it. One match.",
  ambition:"Send whoever you think belongs above me. I'll give the office a very short meeting about where I go on the card.",
  answer:"I heard every word. None of it changes what happens when I get my hands on you.",
  accept:"Accepted. If you have anybody you want at ringside to talk you out of it, make that call tonight."},
 "Bobby Lashley":{
  hold:"the Hurt Lock",
  finish:"Spear",
  challenge:"I'll make it simple, {B}. Say yes. Once the bell rings, we'll find out what you can do when you can't move me.",
  ambition:"Send me the strongest person you trust to close the show. I want to know what you do with the card once I put them down.",
  answer:"You can raise your voice. You're going to need something stronger than that in the ring.",
  accept:"I'll be there. Be ready to fight for every inch you think you own."},
 "Jamie Hayter":{
  finish:"Hayterade",
  challenge:"I want one match, {B}. When I hit you, you'll know exactly who asked for it.",
  ambition:"I'm through making do with whatever minutes are left. Give me the last match and someone who hits back.",
  answer:"I've been hit harder than that by people who meant it. Go on, have another go.",
  accept:"You're on. Hope you've got a better answer for me once we're throwing forearms."},
 "Thekla":{
  hold:"the Death Trap",
  finish:"Spear",
  challenge:"Everyone's very brave before they get caught, {B}. Say yes. I'd like to see what you're like after.",
  ambition:"Put me in the last match. I want everybody who thought they could leave early to change their mind.",
  answer:"Look how much effort you put into acting like you're not bothered. That's my favorite bit.",
  accept:"Of course. Come a little closer next time. I want to see your face when it starts to go wrong."},
 "Britt Baker":{
  hold:"Lockjaw",
  finish:"Curb Stomp",
  challenge:"You want to call yourself the face of this division, {B}? Open your calendar. I've got time to see you in the ring.",
  ambition:"You put my name at the top of the card because people know it. You keep it there because I know what to do when the camera turns on.",
  answer:"You're awfully proud of that line. I'll give you a second opinion when the bell rings.",
  accept:"Book it. And save the date, because I doubt you'll want a follow-up."},
 "Willow Nightingale":{
  near:"a Pounce",
  finish:"Babe with the Powerbomb",
  challenge:"I like a good fight, {B}, and I think you can give me one. Say yes. I'll still be smiling when it's time to hit you.",
  ambition:"When I say I want the main event, I mean I want every minute of it. Even the part where you find out how much you've got left.",
  answer:"Being nice to you doesn't mean I'm easy to beat. You're welcome to learn the difference.",
  accept:"Yeah! Let's see how hard we can make each other work for that last three-count."},
 "Kris Statlander":{
  finish:"Staturday Night Fever",
  challenge:"We've got a ring and a referee, {B}. Give me a yes and I'll handle the lifting.",
  ambition:"I don't need a speech about being the strongest. Put me in the last match and let me do something you can see.",
  answer:"You can have the mic. I came here to pick somebody up and put them down.",
  accept:"Fine by me. If you wanted a gentle landing you should've asked somebody else."},
 "Sami Zayn":{
  finish:"Helluva Kick",
  challenge:"I could give you a hundred reasons why I need this match, {B}. Here's the one that matters. I have to know if I can beat you. Say yes.",
  ambition:"People can put me wherever they want. I still know which match I came here to be in. Give me a shot at earning it.",
  answer:"I hear you. I hear all of it. You think you're the first person to be right about my chances and wrong about me?",
  accept:"Yes. I know exactly what this is going to take. That's why I want it."},
 "Randy Orton":{
  near:"a draping DDT",
  finish:"RKO",
  challenge:"One match, {B}. You can spend the whole thing looking for the RKO. They all do.",
  ambition:"Put me in the last match. You'll have your ending as soon as I see it.",
  answer:"I was listening. I was also looking at where your chin was when you said it.",
  accept:"Sure. The part you're going to remember won't take very long."},
 "Bron Breakker":{
  finish:"Spear",
  challenge:"You ready to get hit, {B}? Because I'm ready to stop standing here. One match. Say yes.",
  ambition:"I'm going to take the fastest route to the top of this card. Put somebody in the way if you want.",
  answer:"You sound good standing still. Let's see how you sound when I come off the ropes.",
  accept:"Yeah! And when that bell rings you'd better already be moving."},
 "Jey Uso":{
  finish:"Uso Splash",
  challenge:"This place heard you, {B}. Now look at me. You want me in there one on one, or you just want to be heard?",
  ambition:"Give me the last match. Let me see who in this building still has a voice left when I'm done.",
  answer:"You can tell them who you think I am. They know who they came to see.",
  accept:"Yeah, you got me. Say it again so everybody in the back can hear you ask for it."},
 "LA Knight":{
  finish:"BFT",
  challenge:"Let me ask you something, {B}. You want a match, or you want another thirty seconds standing next to me while this camera's on?",
  ambition:"Put the loudest person in the building on last. If the office needs help figuring out who that is, open a damn door and listen.",
  answer:"That sounded great in your head, didn't it? Out here it sounded like you wanted my attention. Well, now you've got it.",
  accept:"Yeah. You've got your match. Now try to come up with a better ending than that speech."},
 "Jacob Fatu":{
  finish:"Mighty Moonsault",
  challenge:"You want to be the one to stop me, {B}? Get in the ring. Give me a yes and I'll give you the chance.",
  ambition:"Give me the last match, and give me somebody big enough to make me work for it. I came hungry.",
  answer:"Get all of it out now. When I come across that ring, you're going to want that air back.",
  accept:"I'm there. I'm coming fast, and you don't get to ask me to slow down."},
 "Logan Paul":{
  finish:"Knockout Punch",
  challenge:"Think of the biggest audience you've ever had, {B}. Now say yes and try not to look nervous in front of mine.",
  ambition:"I'll bring the people. You give me the last match and try not to act surprised when it works.",
  answer:"That was good. Do it again, but look over here. I want the clip to show who actually brought the audience.",
  accept:"Done. I'll make sure they get the whole thing on camera. You're going to want proof you were there."},
 "Dominik Mysterio":{
  finish:"Frog Splash",
  challenge:"You wanna fight me, {B}? One match. Try to let me finish the sentence before you start complaining about how I win it.",
  ambition:"Put me on last. Listen to these people. They're still mad every time I leave.",
  answer:"Go on. They boo me louder than that for picking up the mic. You're gonna have to do better.",
  accept:"Fine. And when they count three, I don't want to hear a word about what you thought the referee saw."},
 "Drew McIntyre":{
  near:"a Future Shock DDT",
  finish:"Claymore",
  challenge:"I've heard what you say when I'm not here, {B}. You're here now. One match. Say it where I can hear you.",
  ambition:"Give me the last match. I want to see what happens when the person everybody makes excuses for has to get up after a Claymore.",
  answer:"Say it again. I want a nice clean clip to play next to the part where I kick your head off.",
  accept:"Aye, you're on. Just remember I gave you a chance to walk away while your legs still worked."},
 "Kevin Owens":{
  near:"a pop-up powerbomb",
  finish:"Stunner",
  challenge:"You and me in a match, {B}. I was going to come up with a clever way to ask, but honestly, I just want to hit you.",
  ambition:"Put me in the last match. Tell me who it is before my music starts. Or don't. I'll find out when they come out.",
  answer:"Okay, sure. I could answer all that, or we could go to the ring and save everybody ten minutes.",
  accept:"Yes. Did you need me to take longer to think about it? Because I didn't."},
 "Penta":{
  near:"a Mexican Destroyer",
  finish:"Penta Driver",
  challenge:"Tell them you want it, {B}. One match. When you see me walk toward you, let's see what happens to that courage.",
  ambition:"Put me last. I want the whole building close enough to hear the mat when somebody finds out what fear feels like.",
  answer:"All those words, and you still move your feet back when I come closer.",
  accept:"Sí. You asked for Penta. At the bell, that's exactly what you get."},
 "Oba Femi":{
  finish:"Fall From Grace",
  challenge:"Look at me, {B}. Decide whether that is really a match you want. Then give me your answer.",
  ambition:"The last match belongs to whoever can bear its weight. Put me there and I will show you what that means.",
  answer:"You have mistaken your confidence for strength. The ring will make the distinction clear.",
  accept:"I accept. What you are feeling now is the easy part."},
 "Rey Mysterio":{
  finish:"619 and a springboard splash",
  challenge:"I respect what you can do, {B}. I still want one match. Let's see who makes the other one move first.",
  ambition:"I've spent my whole career looking up at people who said they belonged above me. Give me the last match and I'll keep looking up until the bell.",
  answer:"I've heard that one before. Usually from somebody who thought I was too small to get around them.",
  accept:"You've got it. Keep your eyes on me, because I'm not going to be where you expect."},
 "Bronson Reed":{
  finish:"Tsunami",
  challenge:"I want one match, {B}. Remember how easy it was to stand up and say yes.",
  ambition:"Put me on last. I want the whole building looking up when I climb.",
  answer:"Get it all out now. You don't want to be doing that with me coming down on you.",
  accept:"Done. If you see me leave my feet, you've waited too long."},
 "Damian Priest":{
  finish:"South of Heaven",
  challenge:"Look at me, {B}. You want to know where you stand with me? One match. We'll find out together.",
  ambition:"I want the last match. Give it to me under the lights with somebody who won't make me take it easy.",
  answer:"You keep talking like you know how dark it gets in there. I'm happy to show you.",
  accept:"You've got it. I'll give you time to think about it. Use it."},
 "Trick Williams":{
  finish:"Trick Shot",
  challenge:"Look around, {B}. They came ready to chant. Say yes and give me a reason to make them louder.",
  ambition:"You could tell these people Trick's on last right now and they'd start making noise. Put me there and let me pay that off.",
  answer:"You did all that talking and look who they're saying when you stop.",
  accept:"Bet. Bring your best, because these people aren't saving any of that noise for you."},
 "Liv Morgan":{
  finish:"ObLIVion",
  challenge:"You keep looking over your shoulder, {B}. Turn around. I'm right here, and I'm asking for one match.",
  ambition:"I want the last match. I want everybody who's ever overlooked me sitting where I can see them when I win it.",
  answer:"Aw, you really thought that would hurt my feelings. That's the first nice thing you've done for me tonight.",
  accept:"Yes. And now you've got all that time to wonder what I'm going to do."},
 "Charlotte Flair":{
  hold:"the Figure Eight",
  finish:"Natural Selection",
  challenge:"You want to measure yourself against me, {B}? One match. I won't make the standard any lower to help you reach it.",
  ambition:"I expect to go on last. Anybody who thinks that's arrogance can find out in the ring what I do to earn it.",
  answer:"People say all kinds of things about me before they have to wrestle me. You've got plenty of company.",
  accept:"I accept. When it's over, I want you to know exactly how good you had to be."},
 "Bianca Belair":{
  finish:"K.O.D.",
  challenge:"You wanna find out who can go hardest when it counts, {B}? One match. You bring your best and I'll bring the rest.",
  ambition:"Give me the last match. I want everybody who thinks they know what my limit is to stay long enough to see it move.",
  answer:"You had all that to say and I'm still standing right here. Guess you're gonna need to do more than talk.",
  accept:"Let's do it. I want you at your best so there's nothing left to argue about."},
 "Tiffany Stratton":{
  finish:"Prettiest Moonsault Ever",
  challenge:"You've been looking at my spot all night, {B}. Say yes. I'll let you see it from the mat.",
  ambition:"Put me on last. People already wait through the rest of the show to see me anyway.",
  answer:"You wanted my attention and you got it. I hope it was everything you dreamed of.",
  accept:"Fine. A close-up will be great for you. Try to remember where the camera is before I go up."},
 "Stephanie Vaquer":{
  near:"a Devil's Kiss",
  finish:"SVB",
  challenge:"I want one match, {B}. You can watch the tape again if you like. It feels different when I have you in front of me.",
  ambition:"Give me the last match and the toughest person you have. I want the crowd to see what I can do when somebody makes me work.",
  answer:"You want to talk me out of my confidence. You'll have to take it from me in the ring.",
  accept:"Sí. I'll be there. I want you to feel every second of the match you asked for."},
 "IYO SKY":{
  finish:"Over the Moonsault",
  challenge:"One match, {B}. Look up when you think you've got me trapped. You might learn something.",
  ambition:"Put me last. I want the whole building watching when the ring runs out and I keep going.",
  answer:"You talk like you know where I'll be. That is going to be a problem for you.",
  accept:"Yes. Watch the corners. I'm going to make you choose which one to look at."},
 "Jade Cargill":{
  near:"an Eye of the Storm",
  finish:"Jaded",
  challenge:"One match, {B}. I want to see what you do when you finally run out of room to back up.",
  ambition:"Give me the last match. Let them spend the whole show wondering who you're going to send out to stand across from me.",
  answer:"You keep looking for a reaction. You'll get one when I get my hands on you.",
  accept:"Deal. I'm going to make the part you asked for look easy."},
 "Alexa Bliss":{
  finish:"Twisted Bliss",
  challenge:"One match, {B}. You can keep smiling like you already know how it goes. I like that better.",
  ambition:"Put me on last and send whoever thinks this is going to be an easy night. I want to see the look on their face when it isn't.",
  answer:"Aw. I could tell you were building up to that. Go ahead and enjoy it while you can.",
  accept:"Sure. Just promise you'll keep that same smile when I get to the top rope."},
 "Chelsea Green":{
  finish:"Unprettier",
  challenge:"I am willing to give you one match, {B}, despite absolutely nobody clearing this with me. I expect you to say yes and thank me.",
  ambition:"I have a very reasonable complaint about the last match. It has the wrong name in it. I brought my own pen.",
  answer:"I'll take that as feedback. And if you want my feedback, I'll deliver it in person once the bell rings.",
  accept:"Fine. I am agreeing under protest. Please make sure you get the part where I win on camera."}
};
const TEAM_FINISH={
 'Matt Jackson|Nick Jackson':'the BTE Trigger',
 'Jey Uso|Jimmy Uso':'the 1D',
 'Cash Wheeler|Dax Harwood':'the Big Rig'
};
function wrestlerTeamFinish(a,b){
 if(!a||!b||a.cw&&a.oc||b.cw&&b.oc)return '';
 return TEAM_FINISH[[a.name,b.name].sort().join('|')]||'';
}
function wrestlerVoice(w,key){
 if(!w||w.cw&&w.oc||!Object.hasOwn(VOICE,w.name))return '';
 return VOICE[w.name][key]||'';
}
function voicedPromo(text,w,key){
 const line=wrestlerVoice(w,key);
 return line?text.replace(/"[^"]+"/,()=>`"${line}"`):text;
}
Object.assign(window,{wrestlerVoice,wrestlerTeamFinish,voicedPromo});
})();
