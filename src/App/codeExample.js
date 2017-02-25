const html = `<div class="parent"> test
  <div class="child">Child DivChild DivChild DivChild DivChild DivChild </div>
</div>`;

const css = `.parent {
  position: relative;
}

.child {
  position: absolute;
  top: -15px;
  left: -15px;
  width: 50%;
}

.parent { background-color: rgb(47, 61, 144); }
.child { background-color: rgb(255, 209, 198); }`;

export default { html, css };
