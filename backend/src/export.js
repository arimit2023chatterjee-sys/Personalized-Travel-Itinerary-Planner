export function toMarkdown(itinerary) {
  const lines = [
    `# ${itinerary.title}`,
    "",
    itinerary.vibeNarrative,
    ""
  ];
  for (const day of itinerary.days) {
    lines.push(`## Day ${day.day}: ${day.theme}`);
    lines.push(day.summary);
    lines.push("");
    for (const block of day.blocks) {
      lines.push(`- **${block.start}–${block.end}** · ${block.title} (${block.kind}${block.area ? `, ${block.area}` : ""})`);
      if (block.notes) lines.push(`  - ${block.notes}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function toPrintableHtml(itinerary) {
  const days = itinerary.days
    .map(
      (day) => `
      <section>
        <h2>Day ${day.day}: ${day.theme}</h2>
        <p>${day.summary}</p>
        <ul>
          ${day.blocks
            .map(
              (block) => `<li><strong>${block.start}–${block.end}</strong> — ${block.title} <em>${block.kind}${
                block.area ? ` · ${block.area}` : ""
              }</em>${block.notes ? `<br/>${block.notes}` : ""}</li>`
            )
            .join("")}
        </ul>
      </section>`
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${itinerary.title}</title>
    <style>
      body { font-family: Georgia, serif; max-width: 760px; margin: 40px auto; color: #1c1915; }
      h1 { font-size: 28px; }
      h2 { margin-top: 28px; }
      li { margin: 8px 0; }
    </style>
  </head>
  <body>
    <h1>${itinerary.title}</h1>
    <p>${itinerary.vibeNarrative}</p>
    ${days}
  </body>
</html>`;
}
