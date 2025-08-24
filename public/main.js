// src/client/main.ts
var journaux = [
  [
    "ABB a compl\xE9t\xE9 le niveau 1",
    "13:06"
  ],
  [
    "ACC a compl\xE9t\xE9 le niveau 1",
    "13:06"
  ],
  [
    "AAA a compl\xE9t\xE9 le chapitre 1 niveau 1",
    "13:06"
  ],
  [
    "AHH a compl\xE9t\xE9 le niveau 1",
    "13:06"
  ]
];
var journal = document.querySelector("main > section:nth-child(1)");
if (!journal) throw new Error("mauvaise page.");
for (const ligne of journaux) {
  const p = document.createElement("p");
  p.innerText = ligne[0];
  p.setAttribute("data-at", ligne[1]);
  journal.appendChild(p);
}
