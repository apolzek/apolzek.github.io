---
title: "Dialogue on the New Tool"
slug: "dialogue-on-the-new-tool"
date: '2026-09-01T12:00:00-03:00'
draft: false
description: "A Socratic dialogue at a bar after work: Glaucon shows up excited about a new tool and Socrates asks what it actually solves."
tags:
- philosophy
- dialogues
- technology
minute: 7
---

*Setting: late afternoon, a bar table near the office. Glaucon arrives with his laptop under his arm and opens it before even sitting down.*

**GLAUCON:** Socrates, I found the tool that solves everything. I read the documentation last night, got an example running in twenty minutes and it worked on the first try. I am going to rewrite the whole system on top of it.

**SOCRATES:** Twenty minutes. When you test drive a car, how long does it last?

**GLAUCON:** About fifteen minutes. A lap around the block with the salesman beside you.

**SOCRATES:** And have you ever found a defect in a car on a lap around the block?

**GLAUCON:** Never. Defects show up later. On the highway, in the rain, in stalled traffic.

**SOCRATES:** So in those twenty minutes, did you get to know the tool, or did you get to know the route its author chose for you to take?

**GLAUCON:** The route. But I liked the route.

**SOCRATES:** Liking it is already something. Let me ask you a few questions, then. Just do not answer with what you imagine. Answer with what you know.

**GLAUCON:** Go ahead.

**SOCRATES:** How many records went through it in your test?

**GLAUCON:** About a thousand.

**SOCRATES:** And on an ordinary day, in production?

**GLAUCON:** About ten million.

**SOCRATES:** And what does it do when it cannot keep up? Hold what is coming in, drop it, or go down with it?

**GLAUCON:** I do not know. I never got to that point.

**SOCRATES:** Nobody does, in a test. And notice: scale does not invent any defects. It promotes the ones that were already there and nobody saw. A slow operation over a thousand records is invisible. Over ten million, it is the whole system. You will not discover new defects in production, you will discover the real size of the ones you already had.

**SOCRATES:** What language was it written in?

**GLAUCON:** Does it matter? It runs in a container, I do not even need to know.

**SOCRATES:** It is the one part of it you will not be able to swap later. The language has already decided, before you arrived, a lot of things you will only feel in production. Which is it?

**GLAUCON:** Rust.

**SOCRATES:** Then it is compiled, and that gives you good things for free. It will arrive as a single file, with no interpreter or loose dependency to carry along, and it starts in a blink. An interpreted tool forces you to look after it and its interpreter for the rest of your life.

**GLAUCON:** Great. So it is the right choice.

**SOCRATES:** It is a choice, and every choice has the other side facing down. That single file carries inside it the libraries the author chose, in the versions he chose, on the day he compiled it. When a problem shows up in one of those libraries, you do not swap the part. You wait for him to compile again.

**GLAUCON:** I had not thought of that.

**SOCRATES:** It is the same package, looked at from the other side. Second thing: Rust has no garbage collector.

**GLAUCON:** That is good, isn't it?

**SOCRATES:** It is good for one specific thing. A language with a collector has a janitor who cleans the house when he decides to, not when you ask, and that shows up as a slowness that arrives unannounced and leaves on its own, right when volume grows. Without a collector, response time is predictable, and predictable is worth a lot.

**GLAUCON:** So I have nothing to worry about regarding memory.

**SOCRATES:** You do, and of a quieter kind. Without a collector nothing gets swept up by accident: whatever the tool holds, it holds until the end. An unbounded queue or a cache nobody told to stop do not show up as a pause, they show up as a line slowly climbing for a week until someone gets woken up in the middle of the night. A garbage collector is noisy and warns you. Its absence is silent.

**GLAUCON:** Can that be known beforehand?

**SOCRATES:** Two questions settle it. How much memory it consumes after a week running, and not in the first ten minutes. And how many cores it actually uses, because it is one thing for the language to know how to use eight, and another for the tool to have been written for that.

**GLAUCON:** That changes the whole design.

**SOCRATES:** It does, and it is far better to change it now, while it is still paper. Next: how does a person prove to it that they are who they say they are?

**GLAUCON:** Username and password, created right there inside it.

**SOCRATES:** And in your company, how do people prove that everywhere else?

**GLAUCON:** Through LDAP.

**SOCRATES:** Then it will be the only place in the company where a person exists twice, and whoever gets let go on a Friday will leave every place except one. Now the other half: after the person gets in, who decides what they can do?

**GLAUCON:** Whoever gets in can do everything, I think.

**SOCRATES:** You just treated as one thing what are two. One is who gets in. The other is what each one does after getting in. A tool for a single person does not need to separate the two, because the person is you.

**GLAUCON:** It is just that nobody on my team would cause damage on purpose.

**SOCRATES:** It is almost never on purpose. Permissions do not exist out of distrust, they exist to limit the size of a distracted person's mistake on a Tuesday. When everyone can do everything, everyone carries the power to bring everything down, and nobody asked for that power.

**GLAUCON:** I had never thought of it that way.

**SOCRATES:** And when someone deletes what they should not have, do you find out who it was?

**GLAUCON:** I do not know whether it keeps that.

**SOCRATES:** Ask. A log does not exist to accuse anyone, it exists precisely so that nobody needs to be accused. Without it, on the day of the problem everyone who had access is a suspect, and the conversation becomes memory against memory. Memory is the most biased witness there is.

**SOCRATES:** When did its last version come out?

**GLAUCON:** About two months ago, I think.

**SOCRATES:** And the one before that?

**GLAUCON:** I did not look.

**SOCRATES:** Look, because the interval between versions is the clock you will tie yours to. And look at something finer: between one big version and the next, do small versions come out, with fixes only?

**GLAUCON:** I did not notice.

**SOCRATES:** Notice. If they do, on the day of a serious problem you update a decimal place and go back to sleep. If they do not, the fix only arrives together with the next big version, with everything else it changes thrown in, and an afternoon's problem becomes a whole migration on a day you did not choose.

**GLAUCON:** That I can check today.

**SOCRATES:** Check it along with this one: how many people actually maintain it?

**GLAUCON:** The repository has eight thousand stars and hundreds of contributors.

**SOCRATES:** A star is applause, and applause fixes nothing. A contributor, on most of those lists, is anyone who ever fixed a comma in the documentation. Count something else: in the last six months, how many different names touched the *core* of the tool? And of those, how many are left after you remove the first one?

**GLAUCON:** I do not know. I imagine few.

**SOCRATES:** If one is left, you did not choose a tool. You chose a person, and that person signed nothing with you.

**GLAUCON:** Are there many questions left?

**SOCRATES:** One. You said it does almost everything you need. And the almost?

**GLAUCON:** Whatever is missing, I open an issue and ask.

**SOCRATES:** Always? Every time a new need appears, the path will be to ask and wait?

**GLAUCON:** It is what can be done.

**SOCRATES:** Then notice what you accepted: the pace of what you deliver becomes decided by people who do not know your problem and owe you nothing. There is another path, and it is the difference between a tool and a wall: a place where you yourself write what was missing. A plugin, a hook, a script it calls at the right moment. When that place exists, what is missing today is your work. When it does not, what is missing today is waiting.

**GLAUCON:** Socrates, I could hardly answer anything.

**SOCRATES:** And it is the best thing that happened to you today. Notice that you did not discover that the tool is bad. You discovered that you do not know it. Those are very different things, and only one of them can be fixed.

**GLAUCON:** But I was confident.

**SOCRATES:** You were confident of what you saw, and you saw twenty minutes chosen by someone else. Everyone is confident at the start. The difference is that some discover the questions before installing, and others discover them afterwards, with the whole system standing on top of them.

**GLAUCON:** So I give up on it?

**SOCRATES:** That is not what I said. Maybe it is excellent. Go after every answer and come back with them. If they are good, you install it knowing what you installed. If they are bad, you already know where it will hurt, and sometimes you install it anyway, on purpose, because hurting in that spot is acceptable.

**GLAUCON:** And if I am wrong even after asking everything?

**SOCRATES:** You will be wrong now and then, and that is fine. Put the new thing where a mistake is cheap, on an edge you can switch off in an afternoon without waking anyone, and keep the middle boring and predictable. **Before asking what a tool does, ask how much it costs to leave it**. That is the one answer nobody writes in the documentation.

**GLAUCON:** I am going to redo the diagram.

**SOCRATES:** Not today. Keep it for a week and open it again. Enthusiasm is good fuel and a terrible driver.

..then Socrates closed the laptop, Glaucon saved the diagram without deleting anything, and the two went for a beer.

## Note

The idea was to take the dialogue form of **Plato's Republic** and apply it to a technology case. Only the form is borrowed: short questions, one idea at a time, the interlocutor's answer opening the next question.

The case is familiar to anyone who works with this. Every week a new tool appears, open source, with a pretty interface, an example that boots in five minutes and a star chart going up. At that point everything seems solved, and the enthusiasm is legitimate.

Things get more complicated when the questions begin. How it behaves at scale. What happens on the day you need something the author did not foresee. How long a bug report takes to become a fix, and whether anyone even replies. How many real maintainers stand behind the repository numbers, and from how many different companies. Who decides the direction of the project, and where that decision is discussed. How it does authentication, and whether that talks to the login the rest of the company already uses. What it does when a piece of it goes down. Whether you can audit afterwards who did what inside it. And how much work it actually is to integrate it with what you already have running.

Almost none of these answers are on the first page. Most show up about six months later, when switching is no longer free.
