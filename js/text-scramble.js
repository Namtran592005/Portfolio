export class TextScrambleEffect {
  constructor(t) {
    (this.el = t),
      (this.chars = "█▓▒░-_\\/[]<>*#"),
      (this.colorClasses = ["sc-blue", "sc-green", "sc-red"]),
      (this.update = this.update.bind(this));
  }
  setText(t) {
    const e = this.el.innerText,
      s = Math.max(e.length, t.length),
      r = new Promise((t) => (this.resolve = t));
    this.queue = [];
    for (let r = 0; r < s; r++) {
      const s = e[r] || "",
        h = t[r] || "",
        a = 3 * r,
        i = a + 15 + Math.floor(5 * Math.random()),
        o = this.colorClasses[r % this.colorClasses.length];
      this.queue.push({ from: s, to: h, start: a, end: i, colorClass: o });
    }
    return (
      cancelAnimationFrame(this.frameRequest),
      (this.frame = 0),
      this.update(),
      r
    );
  }
  update() {
    let t = "",
      e = 0;
    for (let s = 0, r = this.queue.length; s < r; s++) {
      let {
        from: r,
        to: h,
        start: a,
        end: i,
        char: o,
        colorClass: l,
      } = this.queue[s];
      this.frame >= i
        ? (e++, (t += h))
        : this.frame >= a
        ? ((!o || Math.random() < 0.28) &&
            ((o = this.randomChar()), (this.queue[s].char = o)),
          (t += `<span class="scramble-char ${l}">${o}</span>`))
        : (t += r);
    }
    (this.el.innerHTML = t),
      e === this.queue.length
        ? this.resolve()
        : ((this.frameRequest = requestAnimationFrame(this.update)),
          this.frame++);
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}
