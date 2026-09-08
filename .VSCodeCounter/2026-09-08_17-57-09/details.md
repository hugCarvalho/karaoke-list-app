# Details

Date : 2026-09-08 17:57:09

Directory /home/hugo/Documents/coding_2025/karaoke-list-app

Total : 140 files,  20028 codes, 705 comments, 1411 blanks, all 22144 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.github/workflows/main.yml](/.github/workflows/main.yml) | YAML | 28 | 1 | 8 | 37 |
| [backend/api/index.ts](/backend/api/index.ts) | TypeScript | 53 | 4 | 12 | 69 |
| [backend/index.d.ts](/backend/index.d.ts) | TypeScript | 9 | 0 | 3 | 12 |
| [backend/package-lock.json](/backend/package-lock.json) | JSON | 3,304 | 0 | 1 | 3,305 |
| [backend/package.json](/backend/package.json) | JSON | 42 | 0 | 1 | 43 |
| [backend/src/config/db.ts](/backend/src/config/db.ts) | TypeScript | 12 | 0 | 2 | 14 |
| [backend/src/config/resend.ts](/backend/src/config/resend.ts) | TypeScript | 4 | 0 | 3 | 7 |
| [backend/src/constants/appErrorCode.ts](/backend/src/constants/appErrorCode.ts) | TypeScript | 4 | 0 | 2 | 6 |
| [backend/src/constants/audience.ts](/backend/src/constants/audience.ts) | TypeScript | 5 | 0 | 2 | 7 |
| [backend/src/constants/env.ts](/backend/src/constants/env.ts) | TypeScript | 15 | 0 | 4 | 19 |
| [backend/src/constants/http.ts](/backend/src/constants/http.ts) | TypeScript | 21 | 0 | 2 | 23 |
| [backend/src/constants/verificationCodeType.ts](/backend/src/constants/verificationCodeType.ts) | TypeScript | 5 | 0 | 2 | 7 |
| [backend/src/controllers/auth.controller.ts](/backend/src/controllers/auth.controller.ts) | TypeScript | 69 | 3 | 18 | 90 |
| [backend/src/controllers/auth.schemas.ts](/backend/src/controllers/auth.schemas.ts) | TypeScript | 21 | 0 | 7 | 28 |
| [backend/src/controllers/events.controller.ts](/backend/src/controllers/events.controller.ts) | TypeScript | 98 | 7 | 32 | 137 |
| [backend/src/controllers/openai.controller.ts](/backend/src/controllers/openai.controller.ts) | TypeScript | 65 | 11 | 25 | 101 |
| [backend/src/controllers/session.controller.ts](/backend/src/controllers/session.controller.ts) | TypeScript | 38 | 2 | 4 | 44 |
| [backend/src/controllers/songList.controller.ts](/backend/src/controllers/songList.controller.ts) | TypeScript | 282 | 27 | 60 | 369 |
| [backend/src/controllers/user.controller.ts](/backend/src/controllers/user.controller.ts) | TypeScript | 9 | 1 | 2 | 12 |
| [backend/src/middleware/authenticate.ts](/backend/src/middleware/authenticate.ts) | TypeScript | 25 | 2 | 5 | 32 |
| [backend/src/middleware/errorHandler.ts](/backend/src/middleware/errorHandler.ts) | TypeScript | 34 | 0 | 10 | 44 |
| [backend/src/models/artistdb.model.ts](/backend/src/models/artistdb.model.ts) | TypeScript | 19 | 0 | 5 | 24 |
| [backend/src/models/locationsdb.model.ts](/backend/src/models/locationsdb.model.ts) | TypeScript | 20 | 4 | 7 | 31 |
| [backend/src/models/session.model.ts](/backend/src/models/session.model.ts) | TypeScript | 28 | 0 | 4 | 32 |
| [backend/src/models/song.model.ts](/backend/src/models/song.model.ts) | TypeScript | 37 | 1 | 8 | 46 |
| [backend/src/models/user.model.ts](/backend/src/models/user.model.ts) | TypeScript | 41 | 0 | 8 | 49 |
| [backend/src/models/verificationCode.model.ts](/backend/src/models/verificationCode.model.ts) | TypeScript | 25 | 0 | 4 | 29 |
| [backend/src/routes/auth.route.ts](/backend/src/routes/auth.route.ts) | TypeScript | 11 | 1 | 4 | 16 |
| [backend/src/routes/events.route.ts](/backend/src/routes/events.route.ts) | TypeScript | 8 | 1 | 3 | 12 |
| [backend/src/routes/list.route.ts](/backend/src/routes/list.route.ts) | TypeScript | 12 | 1 | 3 | 16 |
| [backend/src/routes/openai.route.ts](/backend/src/routes/openai.route.ts) | TypeScript | 8 | 2 | 5 | 15 |
| [backend/src/routes/session.route.ts](/backend/src/routes/session.route.ts) | TypeScript | 6 | 1 | 4 | 11 |
| [backend/src/routes/user.route.ts](/backend/src/routes/user.route.ts) | TypeScript | 5 | 1 | 4 | 10 |
| [backend/src/services/auth.service.ts](/backend/src/services/auth.service.ts) | TypeScript | 195 | 9 | 35 | 239 |
| [backend/src/services/openai.service.ts](/backend/src/services/openai.service.ts) | TypeScript | 181 | 53 | 17 | 251 |
| [backend/src/utils/AppError.ts](/backend/src/utils/AppError.ts) | TypeScript | 12 | 0 | 3 | 15 |
| [backend/src/utils/appAssert.ts](/backend/src/utils/appAssert.ts) | TypeScript | 17 | 3 | 3 | 23 |
| [backend/src/utils/bcrypt.ts](/backend/src/utils/bcrypt.ts) | TypeScript | 5 | 0 | 3 | 8 |
| [backend/src/utils/catchErrors.ts](/backend/src/utils/catchErrors.ts) | TypeScript | 11 | 1 | 4 | 16 |
| [backend/src/utils/cookies.ts](/backend/src/utils/cookies.ts) | TypeScript | 34 | 1 | 8 | 43 |
| [backend/src/utils/date.ts](/backend/src/utils/date.ts) | TypeScript | 6 | 0 | 6 | 12 |
| [backend/src/utils/emailTemplates.ts](/backend/src/utils/emailTemplates.ts) | TypeScript | 10 | 0 | 2 | 12 |
| [backend/src/utils/jwt.ts](/backend/src/utils/jwt.ts) | TypeScript | 49 | 0 | 11 | 60 |
| [backend/src/utils/sendMail.ts](/backend/src/utils/sendMail.ts) | TypeScript | 20 | 0 | 5 | 25 |
| [backend/src/utils/strings.ts](/backend/src/utils/strings.ts) | TypeScript | 11 | 5 | 1 | 17 |
| [backend/tsconfig.json](/backend/tsconfig.json) | JSON with Comments | 25 | 3 | 1 | 29 |
| [frontend/.eslintrc.cjs](/frontend/.eslintrc.cjs) | JavaScript | 30 | 0 | 1 | 31 |
| [frontend/.github/workflows/ci.yml](/frontend/.github/workflows/ci.yml) | YAML | 28 | 1 | 8 | 37 |
| [frontend/index.html](/frontend/index.html) | HTML | 42 | 34 | 16 | 92 |
| [frontend/jest.config.cjs](/frontend/jest.config.cjs) | JavaScript | 12 | 10 | 1 | 23 |
| [frontend/package-lock.json](/frontend/package-lock.json) | JSON | 9,493 | 0 | 1 | 9,494 |
| [frontend/package.json](/frontend/package.json) | JSON | 48 | 0 | 1 | 49 |
| [frontend/public/site.webmanifest](/frontend/public/site.webmanifest) | JSON | 19 | 0 | 1 | 20 |
| [frontend/sample.env](/frontend/sample.env) | Dotenv | 1 | 0 | 0 | 1 |
| [frontend/src/App.tsx](/frontend/src/App.tsx) | TypeScript JSX | 89 | 1 | 9 | 99 |
| [frontend/src/api/api.ts](/frontend/src/api/api.ts) | TypeScript | 60 | 2 | 6 | 68 |
| [frontend/src/api/http.ts](/frontend/src/api/http.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/components/AlertSuggestions.tsx](/frontend/src/components/AlertSuggestions.tsx) | TypeScript JSX | 48 | 0 | 5 | 53 |
| [frontend/src/components/AppContainer.tsx](/frontend/src/components/AppContainer.tsx) | TypeScript JSX | 14 | 0 | 3 | 17 |
| [frontend/src/components/EmptyList.tsx](/frontend/src/components/EmptyList.tsx) | TypeScript JSX | 11 | 0 | 3 | 14 |
| [frontend/src/components/EventsCard.tsx](/frontend/src/components/EventsCard.tsx) | TypeScript JSX | 121 | 10 | 17 | 148 |
| [frontend/src/components/IconCircle.tsx](/frontend/src/components/IconCircle.tsx) | TypeScript JSX | 23 | 1 | 3 | 27 |
| [frontend/src/components/PageWrapper.tsx](/frontend/src/components/PageWrapper.tsx) | TypeScript JSX | 21 | 0 | 3 | 24 |
| [frontend/src/components/ResetPasswordForm.tsx](/frontend/src/components/ResetPasswordForm.tsx) | TypeScript JSX | 83 | 0 | 2 | 85 |
| [frontend/src/components/SessionCard.tsx](/frontend/src/components/SessionCard.tsx) | TypeScript JSX | 41 | 0 | 4 | 45 |
| [frontend/src/components/SongSuggestionsList.tsx](/frontend/src/components/SongSuggestionsList.tsx) | TypeScript JSX | 52 | 0 | 5 | 57 |
| [frontend/src/components/UserMenu.tsx](/frontend/src/components/UserMenu.tsx) | TypeScript JSX | 33 | 1 | 5 | 39 |
| [frontend/src/components/buttonGroups/AddToggleButtonGroup.tsx](/frontend/src/components/buttonGroups/AddToggleButtonGroup.tsx) | TypeScript JSX | 39 | 0 | 5 | 44 |
| [frontend/src/components/buttonGroups/CheckboxGroup.tsx](/frontend/src/components/buttonGroups/CheckboxGroup.tsx) | TypeScript JSX | 76 | 0 | 7 | 83 |
| [frontend/src/components/buttonGroups/Header.tsx](/frontend/src/components/buttonGroups/Header.tsx) | TypeScript JSX | 24 | 0 | 4 | 28 |
| [frontend/src/components/buttonGroups/ListsToggleGroup.tsx](/frontend/src/components/buttonGroups/ListsToggleGroup.tsx) | TypeScript JSX | 42 | 0 | 5 | 47 |
| [frontend/src/components/buttonGroups/NavButtonGroup.tsx](/frontend/src/components/buttonGroups/NavButtonGroup.tsx) | TypeScript JSX | 43 | 0 | 4 | 47 |
| [frontend/src/components/stats/MostSangBarChart.tsx](/frontend/src/components/stats/MostSangBarChart.tsx) | TypeScript JSX | 96 | 9 | 12 | 117 |
| [frontend/src/components/table/TableBody.tsx](/frontend/src/components/table/TableBody.tsx) | TypeScript JSX | 112 | 2 | 12 | 126 |
| [frontend/src/components/table/TableHeader.tsx](/frontend/src/components/table/TableHeader.tsx) | TypeScript JSX | 60 | 2 | 3 | 65 |
| [frontend/src/components/table/TableWrapper.tsx](/frontend/src/components/table/TableWrapper.tsx) | TypeScript JSX | 16 | 0 | 2 | 18 |
| [frontend/src/config/actions.ts](/frontend/src/config/actions.ts) | TypeScript | 18 | 0 | 2 | 20 |
| [frontend/src/config/apiClient.ts](/frontend/src/config/apiClient.ts) | TypeScript | 33 | 5 | 7 | 45 |
| [frontend/src/config/formInterfaces.ts](/frontend/src/config/formInterfaces.ts) | TypeScript | 22 | 0 | 5 | 27 |
| [frontend/src/config/interfaces.ts](/frontend/src/config/interfaces.ts) | TypeScript | 47 | 6 | 10 | 63 |
| [frontend/src/config/queryClient.ts](/frontend/src/config/queryClient.ts) | TypeScript | 9 | 0 | 3 | 12 |
| [frontend/src/config/types.ts](/frontend/src/config/types.ts) | TypeScript | 6 | 0 | 2 | 8 |
| [frontend/src/constants/email.ts](/frontend/src/constants/email.ts) | TypeScript | 2 | 0 | 0 | 2 |
| [frontend/src/constants/http.ts](/frontend/src/constants/http.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/constants/queries.ts](/frontend/src/constants/queries.ts) | TypeScript | 7 | 0 | 1 | 8 |
| [frontend/src/hooks/list/useDelete.test.tsx](/frontend/src/hooks/list/useDelete.test.tsx) | TypeScript JSX | 88 | 12 | 29 | 129 |
| [frontend/src/hooks/list/useDeleteSong.ts](/frontend/src/hooks/list/useDeleteSong.ts) | TypeScript | 20 | 0 | 4 | 24 |
| [frontend/src/hooks/list/useFilteredSong.test.tsx](/frontend/src/hooks/list/useFilteredSong.test.tsx) | TypeScript JSX | 183 | 23 | 47 | 253 |
| [frontend/src/hooks/list/useFilteredSongs.ts](/frontend/src/hooks/list/useFilteredSongs.ts) | TypeScript | 36 | 0 | 7 | 43 |
| [frontend/src/hooks/list/useSortableList.test.tsx](/frontend/src/hooks/list/useSortableList.test.tsx) | TypeScript JSX | 129 | 27 | 35 | 191 |
| [frontend/src/hooks/list/useSortableList.ts](/frontend/src/hooks/list/useSortableList.ts) | TypeScript | 25 | 1 | 6 | 32 |
| [frontend/src/hooks/list/useUpdatePlayCount.test.tsx](/frontend/src/hooks/list/useUpdatePlayCount.test.tsx) | TypeScript JSX | 158 | 11 | 40 | 209 |
| [frontend/src/hooks/list/useUpdatePlayCount.ts](/frontend/src/hooks/list/useUpdatePlayCount.ts) | TypeScript | 57 | 4 | 11 | 72 |
| [frontend/src/hooks/list/useUpdateSongListTypes.test.tsx](/frontend/src/hooks/list/useUpdateSongListTypes.test.tsx) | TypeScript JSX | 122 | 8 | 34 | 164 |
| [frontend/src/hooks/list/useUpdateSongListTypes.ts](/frontend/src/hooks/list/useUpdateSongListTypes.ts) | TypeScript | 39 | 3 | 10 | 52 |
| [frontend/src/hooks/useAddSong.test.tsx](/frontend/src/hooks/useAddSong.test.tsx) | TypeScript JSX | 166 | 29 | 54 | 249 |
| [frontend/src/hooks/useAddSong.ts](/frontend/src/hooks/useAddSong.ts) | TypeScript | 22 | 0 | 5 | 27 |
| [frontend/src/hooks/useAppToast.ts](/frontend/src/hooks/useAppToast.ts) | TypeScript | 31 | 1 | 7 | 39 |
| [frontend/src/hooks/useAuth.test.tsx](/frontend/src/hooks/useAuth.test.tsx) | TypeScript JSX | 77 | 1 | 21 | 99 |
| [frontend/src/hooks/useAuth.ts](/frontend/src/hooks/useAuth.ts) | TypeScript | 25 | 0 | 3 | 28 |
| [frontend/src/hooks/useCloseEvent.test.tsx](/frontend/src/hooks/useCloseEvent.test.tsx) | TypeScript JSX | 112 | 31 | 39 | 182 |
| [frontend/src/hooks/useCloseEvent.ts](/frontend/src/hooks/useCloseEvent.ts) | TypeScript | 20 | 1 | 3 | 24 |
| [frontend/src/hooks/useCreateEvent.test.tsx](/frontend/src/hooks/useCreateEvent.test.tsx) | TypeScript JSX | 65 | 4 | 19 | 88 |
| [frontend/src/hooks/useCreateEvent.ts](/frontend/src/hooks/useCreateEvent.ts) | TypeScript | 20 | 1 | 4 | 25 |
| [frontend/src/hooks/useDeleteSession.ts](/frontend/src/hooks/useDeleteSession.ts) | TypeScript | 16 | 0 | 4 | 20 |
| [frontend/src/hooks/useFilteredSongOptions.test.tsx](/frontend/src/hooks/useFilteredSongOptions.test.tsx) | TypeScript JSX | 222 | 43 | 60 | 325 |
| [frontend/src/hooks/useFilteredSongOptions.ts](/frontend/src/hooks/useFilteredSongOptions.ts) | TypeScript | 51 | 1 | 11 | 63 |
| [frontend/src/hooks/useSessions.ts](/frontend/src/hooks/useSessions.ts) | TypeScript | 13 | 0 | 5 | 18 |
| [frontend/src/main.tsx](/frontend/src/main.tsx) | TypeScript JSX | 18 | 0 | 2 | 20 |
| [frontend/src/pages/AddSong.tsx](/frontend/src/pages/AddSong.tsx) | TypeScript JSX | 184 | 2 | 19 | 205 |
| [frontend/src/pages/SearchSong.tsx](/frontend/src/pages/SearchSong.tsx) | TypeScript JSX | 156 | 10 | 9 | 175 |
| [frontend/src/pages/SongList.tsx](/frontend/src/pages/SongList.tsx) | TypeScript JSX | 104 | 5 | 8 | 117 |
| [frontend/src/pages/SongsSang.tsx](/frontend/src/pages/SongsSang.tsx) | TypeScript JSX | 233 | 8 | 15 | 256 |
| [frontend/src/pages/auth/ForgotPassword.tsx](/frontend/src/pages/auth/ForgotPassword.tsx) | TypeScript JSX | 94 | 0 | 7 | 101 |
| [frontend/src/pages/auth/Login.tsx](/frontend/src/pages/auth/Login.tsx) | TypeScript JSX | 117 | 10 | 8 | 135 |
| [frontend/src/pages/auth/Register.tsx](/frontend/src/pages/auth/Register.tsx) | TypeScript JSX | 136 | 13 | 9 | 158 |
| [frontend/src/pages/auth/ResetPassword.tsx](/frontend/src/pages/auth/ResetPassword.tsx) | TypeScript JSX | 39 | 0 | 3 | 42 |
| [frontend/src/pages/auth/VerifyEmail.tsx](/frontend/src/pages/auth/VerifyEmail.tsx) | TypeScript JSX | 52 | 0 | 3 | 55 |
| [frontend/src/pages/auth/login.test.tsx](/frontend/src/pages/auth/login.test.tsx) | TypeScript JSX | 155 | 58 | 68 | 281 |
| [frontend/src/pages/auth/register.test.tsx](/frontend/src/pages/auth/register.test.tsx) | TypeScript JSX | 160 | 11 | 55 | 226 |
| [frontend/src/pages/mainNavigation/EventsHistory.test.tsx](/frontend/src/pages/mainNavigation/EventsHistory.test.tsx) | TypeScript JSX | 200 | 11 | 50 | 261 |
| [frontend/src/pages/mainNavigation/EventsHistory.tsx](/frontend/src/pages/mainNavigation/EventsHistory.tsx) | TypeScript JSX | 171 | 4 | 22 | 197 |
| [frontend/src/pages/profile/Profile.tsx](/frontend/src/pages/profile/Profile.tsx) | TypeScript JSX | 33 | 0 | 2 | 35 |
| [frontend/src/pages/profile/Settings.tsx](/frontend/src/pages/profile/Settings.tsx) | TypeScript JSX | 27 | 0 | 3 | 30 |
| [frontend/src/pages/profile/Statistics.tsx](/frontend/src/pages/profile/Statistics.tsx) | TypeScript JSX | 22 | 0 | 5 | 27 |
| [frontend/src/services/externalApi.ts](/frontend/src/services/externalApi.ts) | TypeScript | 105 | 6 | 22 | 133 |
| [frontend/src/setupTests.ts](/frontend/src/setupTests.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/theme/buttonTheme.ts](/frontend/src/theme/buttonTheme.ts) | TypeScript | 31 | 0 | 5 | 36 |
| [frontend/src/theme/index.ts](/frontend/src/theme/index.ts) | TypeScript | 25 | 0 | 5 | 30 |
| [frontend/src/theme/linkTheme.ts](/frontend/src/theme/linkTheme.ts) | TypeScript | 7 | 0 | 3 | 10 |
| [frontend/src/utils/artists.ts](/frontend/src/utils/artists.ts) | TypeScript | 16 | 0 | 6 | 22 |
| [frontend/src/utils/date.ts](/frontend/src/utils/date.ts) | TypeScript | 10 | 0 | 1 | 11 |
| [frontend/src/utils/navigation.ts](/frontend/src/utils/navigation.ts) | TypeScript | 4 | 0 | 3 | 7 |
| [frontend/src/utils/strings.ts](/frontend/src/utils/strings.ts) | TypeScript | 37 | 9 | 8 | 54 |
| [frontend/tests/utils/artists.test.ts](/frontend/tests/utils/artists.test.ts) | TypeScript | 140 | 17 | 33 | 190 |
| [frontend/tests/utils/helpers.test.ts](/frontend/tests/utils/helpers.test.ts) | TypeScript | 74 | 14 | 18 | 106 |
| [frontend/tests/utils/test-utils.tsx](/frontend/tests/utils/test-utils.tsx) | TypeScript JSX | 29 | 4 | 7 | 40 |
| [frontend/tsconfig.json](/frontend/tsconfig.json) | JSON with Comments | 26 | 91 | 1 | 118 |
| [frontend/vite.config.js](/frontend/vite.config.js) | JavaScript | 9 | 2 | 2 | 13 |
| [readme.md](/readme.md) | Markdown | 54 | 0 | 7 | 61 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)