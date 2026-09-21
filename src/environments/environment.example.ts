// Copie este arquivo para `environment.ts` e preencha com o seu token.
//   cp src/environments/environment.example.ts src/environments/environment.ts
// O `environment.ts` está no .gitignore e NUNCA deve ser commitado.
export const environment = {
  production: false,
  // Read Access Token (v4 auth), gerado em themoviedb.org/settings/api
  tmdbAccessToken: 'SEU_READ_ACCESS_TOKEN_AQUI',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImageBaseUrl: 'https://image.tmdb.org/t/p',
};
