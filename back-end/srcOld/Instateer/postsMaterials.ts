const photos_with_me = [1, 2, 8, 10, 11, 17, 19, 20, 21, 24, 25, 28, 32, 35];
const descriptions = [
  "Non fermarti nel passato, non sognare il futuro, focalizza il pensiero sul momento presente.(Buddha)",
  "L’unica costante della vita è il cambiamento.(Buddha)",
  "Tutto ciò che puoi immaginare è reale.(Pablo Picasso)",
  "Per farmi addormentare mio padre mi lanciava in aria. Purtroppo non era mai lì quando tornavo giù.(Robin Williams)",
  "La migliore libertà è essere se stessi.(Jim Morrison)",
  "Non è quello che guardi che conta, è quello che vedi.(Henry David Thoreau)",
  "Il destino mescola le carte e noi giochiamo.(Arthur Schopenhauer)",
  "Chi non osa nulla, non speri in nulla.(Friedrich von Schiller)",
  "Niente è più prezioso del vivere il momento presente. Completamente vivo, pienamente consapevole.(Thích Nhất Hạnh)",
  "Se non scommetti, non vincerai mai.(Charles Bukowski)",
  "L’unico vero errore è quello da cui non impariamo nulla.(Henry Ford)",
  "L’abbigliamento spesso rivela l’uomo.(William Shakespeare)",
  "Date un titolo a questa foto.",
  "Chi non ride mai non è una persona seria.(Fryderyk Chopin)",
  "La vita è meravigliosa, senza saresti morto.(Leopold Fechtner)",
  "Il futuro dipende da ciò che fai oggi.(Mahatma Gandhi)",
  "Noi facciamo le nostre fortune e le chiamiamo destino.(Earl of Beaconsfield)",
];

export const postsMaterials = {
  photos_with_me,
  descriptions,
};
export const userPhotoPath = (profile: string, photoNumber: number) =>
  `../photos/${profile}/photoN${photoNumber}.jpg`;
