# Plain Q — 3 minute stage script

Judging is 6 Nov, 17:30–20:30, DC 1351. You get a laptop, a projector and about
three minutes. Open the page **before** you walk up:

```sh
./run.sh
# then leave http://127.0.0.1:8765/ open in Chrome, full screen (⌃⌘F)
```

Reset between runs by clicking **Clear the board**. Do not reload the page in
front of judges — the browser flash looks like a crash.

---

## 0:00 — the hook (20s)

> "Every quantum explainer has the same problem. It shows you a circuit and then
> it shows you a histogram, and the histogram means nothing to you. So we built
> the missing half: **a circuit that explains itself**."

Do not open with "quantum computing is the future". Start with the problem.

## 0:20 — the complaint (25s)

> "Here is a normal quantum tool." *(gesture at the empty board)* "You add a gate,
> it gives you `|ψ⟩ = 0.707|00⟩ + 0.707|11⟩`. That is correct, and it is useless
> to a first-year biology student."

> "Our rule was: **no symbol on screen that a user has to already know.**"

Point at the left rail: the boxes are called Mix, Flip, Twist, Link. Not H, X, Z,
CNOT.

## 0:45 — story 1: superposition (25s)

Click **A coin that never lands**.

> "One box on one wire. The machine says: wire A is 0 and 1 at the same time —
> 50% each. And look at the sphere: the arrow points sideways. It is not at the
> top, it is not at the bottom. It has not decided."

## 1:10 — story 2: entanglement (35s)

Click **Two wires, one answer**.

> "Now we link the two wires. Read this: *the wires answer together — 00 or 11,
> they always agree.* And the spheres went **empty**."

*(pause, point at the two blank spheres)*

> "That is the part nobody shows you. Neither qubit has an answer of its own any
> more. If you ask wire A and get 0, wire B is already 0 — no matter how far apart
> they are. That is entanglement, and it took two clicks."

## 1:45 — story 3: interference (40s) ← the money shot

Click **Make a wrong answer cancel**.

> "Three boxes: Mix, Twist, Mix. Look at the step list."

Read step 2 out loud, slowly:

> "*Twist changes a hidden sign. On its own it looks like nothing happened — but
> it decides whether the next Mix adds up or cancels.*"

> "And step 3: **two paths cancelled. `00` just became impossible.** One answer,
> every time, 100%."

> "That is not a filter. The wrong answer never happened. This is the moment
> quantum computing stops being faster and starts being different — and a
> non-expert just watched it happen."

## 2:25 — it is real (20s)

> "Under the hood this is Qiskit on the statevector simulator — exact, not sampled,
> that is why the numbers are clean. Down here *(point at the footer)*: Qiskit
> 2.2, 2 milliseconds. And next to the probabilities, 1024 sampled shots, so you
> can see what a real run would show. Swapping in IBM hardware is the same circuit
> object and a different sampler."

## 2:45 — close (15s)

> "It also runs in Chinese — *(click 中文)* — because half the students in this
> room are not native English speakers, and a tool for non-experts had better not
> be for English-speaking non-experts only."

> "Plain Q. One command to run, no build step, no internet. Ask us anything."

---

## Q&A — the five questions you will actually get

**"Isn't this just IBM Quantum Composer?"**
> "Composer is for people who already know what a gate is. It gives you the
> histogram and stops. We start where it stops — the sentence. And the sentence is
> generated from the state, not from the circuit: the same three boxes give
> different explanations depending on what the numbers say."

**"Where does the explanation come from? Is it an LLM?"**
> "No. It is a rule engine over the real state. Every sentence is a claim you can
> check against the numbers on screen: if it says 50%, the statevector says 0.5.
> An LLM would hallucinate here, and a teaching tool that lies is worse than no
> tool."

**"What if the user makes a circuit you don't have a sentence for?"**
> "The headline comes from the shape of the distribution — one outcome, two, all of
> them, uneven — and the per-qubit state. That covers every circuit you can build
> with these four boxes. It is not a lookup table."

**"Does it run on real hardware?"**
> "Today, simulator. The circuit is a real `QuantumCircuit`; IBM hardware is
> `qiskit-ibm-runtime` and a sampler instead of `Statevector`. We left it out
> because a queue is a bad thing to demo."

**"Who is this for?"**
> "Three uses: a first quantum lecture, an outreach table at an open house, and —
> honestly — a hackathon team explaining itself to judges in three minutes."

---

## 中文备忘（对着上面每一段，照这个意思讲）

1. **开场**：所有量子科普都有同一个毛病——给你电路，再给你一张柱状图，而柱状图对
   你毫无意义。我们做的是缺掉的那一半：一个会解释自己的电路。
2. **痛点**：普通工具告诉你 `|ψ⟩ = 0.707|00⟩ + 0.707|11⟩`。这句是对的，而且没用。
   我们的规矩是：屏幕上不许出现需要先学会才能看懂的符号。
3. **故事一**：一个方块。A 同时是 0 和 1，各 50%。球上的箭头指向侧面——它还没决定。
4. **故事二**：连起来之后，两条线一起回答 00 或 11，永远一致；两个球**空了**。
   谁都没有自己的答案了。这就是纠缠，两次点击。
5. **故事三**（重点）：混 → 扭 → 混。读第二步那句话：扭一下改的是看不见的符号，
   单独看像什么都没发生，但它决定下一次是相加还是抵消。第三步：两条路抵消，
   `00` 变成不可能。这不是事后筛选，是错答案根本没发生。
6. **真的**：Qiskit 状态矢量模拟，精确值；底下写着版本和耗时；旁边是 1024 次采样。
7. **收尾**：也能切中文——给非专业人士做的工具，不该只服务英语母语的非专业人士。

**现场纪律**：每段之间点 **Clear the board** 再点下一个故事；别刷新页面；
别念 `|ψ⟩` 这个符号，念"这个状态"。
