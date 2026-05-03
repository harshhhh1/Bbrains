# File Tree: client

**Generated:** 5/3/2026, 11:28:48 AM
**Root Path:** `d:\projects\Bbrains\client`

```
├── 📁 app
│   ├── 📁 (dashboard)
│   │   ├── 📁 academics
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 AcademicsControls.tsx
│   │   │   │   ├── 📄 AcademicsHeader.tsx
│   │   │   │   ├── 📄 AcademicsLoadingState.tsx
│   │   │   │   ├── 📄 AdminAcademicsPageClient.tsx
│   │   │   │   ├── 📄 AssignmentsTable.tsx
│   │   │   │   ├── 📄 BulkEnrollmentModal.tsx
│   │   │   │   ├── 📄 CourseFormModal.tsx
│   │   │   │   ├── 📄 CoursesTable.tsx
│   │   │   │   ├── 📄 DeleteDialog.tsx
│   │   │   │   ├── 📄 SemesterSection.tsx
│   │   │   │   ├── 📄 StudentsTable.tsx
│   │   │   │   ├── 📄 SubjectEntryRow.tsx
│   │   │   │   └── 📄 TeachersTab.tsx
│   │   │   ├── 📁 hooks
│   │   │   │   ├── 📄 use-academics.ts
│   │   │   │   └── 📄 useCourseForm.ts
│   │   │   ├── 📁 types
│   │   │   │   └── 📄 academics-types.ts
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 achievements
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 achievement-card.tsx
│   │   │   │   ├── 📄 achievements-empty-state.tsx
│   │   │   │   └── 📄 achievements-loading-state.tsx
│   │   │   ├── 📁 hooks
│   │   │   │   └── 📄 use-achievements.ts
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 admin
│   │   │   ├── 📁 achievements
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 audit-log
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 AuditLogCard.tsx
│   │   │   │   │   ├── 📄 AuditLogEmptyState.tsx
│   │   │   │   │   ├── 📄 AuditLogList.tsx
│   │   │   │   │   └── 📄 CategoryFilter.tsx
│   │   │   │   ├── 📁 lib
│   │   │   │   │   ├── 📄 api.ts
│   │   │   │   │   ├── 📄 types.ts
│   │   │   │   │   ├── 📄 use-audit-logs.ts
│   │   │   │   │   └── 📄 utils.ts
│   │   │   │   ├── 📄 AuditLogClient.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 config
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 ConfigForm.tsx
│   │   │   │   │   └── 📄 ConfigTable.tsx
│   │   │   │   ├── 📁 sidebar-access
│   │   │   │   │   ├── 📄 SidebarAccessClient.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📄 ConfigClient.tsx
│   │   │   │   ├── 📄 _types.ts
│   │   │   │   ├── 📄 data.ts
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 finance
│   │   │   │   ├── 📁 components
│   │   │   │   │   └── 📄 AdminFinancePageClient.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 institution
│   │   │   │   ├── 📁 components
│   │   │   │   │   └── 📄 AdminInstitutionPageClient.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 onboarding
│   │   │   ├── 📁 roles
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 AdminRolesPageClient.tsx
│   │   │   │   │   ├── 📄 DisplayTab.tsx
│   │   │   │   │   ├── 📄 EditRoleDialog.tsx
│   │   │   │   │   ├── 📄 EditUserRoleDialog.tsx
│   │   │   │   │   ├── 📄 ManageMembersTab.tsx
│   │   │   │   │   ├── 📄 PermissionMatrix.tsx
│   │   │   │   │   ├── 📄 PermissionsTab.tsx
│   │   │   │   │   ├── 📄 RoleCards.tsx
│   │   │   │   │   ├── 📄 RoleDetail.tsx
│   │   │   │   │   ├── 📄 RoleList.tsx
│   │   │   │   │   └── 📄 UserRolesGrid.tsx
│   │   │   │   ├── 📄 RolesClient.tsx
│   │   │   │   ├── 📄 _types.ts
│   │   │   │   ├── 📄 data.ts
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 students
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 StudentForm.tsx
│   │   │   │   │   └── 📄 StudentsTable.tsx
│   │   │   │   ├── 📄 StudentsClient.tsx
│   │   │   │   ├── 📄 _types.ts
│   │   │   │   ├── 📄 data.ts
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 teachers
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 TeacherForm.tsx
│   │   │   │   │   └── 📄 TeachersTable.tsx
│   │   │   │   ├── 📄 TeachersClient.tsx
│   │   │   │   ├── 📄 _types.ts
│   │   │   │   ├── 📄 data.ts
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📁 xpconfig
│   │   │       ├── 📁 components
│   │   │       │   └── 📄 XpConfigPageClient.tsx
│   │   │       └── 📄 page.tsx
│   │   ├── 📁 announcements
│   │   │   ├── 📁 _features
│   │   │   │   └── 📁 announcements
│   │   │   │       └── 📁 components
│   │   │   │           ├── 📄 AcknowledgeDrawer.tsx
│   │   │   │           ├── 📄 AnnouncementItem.tsx
│   │   │   │           ├── 📄 AnnouncementsContent.tsx
│   │   │   │           └── 📄 PostEditor.tsx
│   │   │   ├── 📄 AnnouncementsClient.tsx
│   │   │   ├── 📄 loading.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 assignments
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 calendar
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 BigCalendar.tsx
│   │   │   │   ├── 📄 CalendarPageClient.tsx
│   │   │   │   ├── 📄 EventCalender.tsx
│   │   │   │   └── 📄 EventDetailsDrawer.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 chat
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 colleges
│   │   │   ├── 📁 [id]
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 CollegeActions.tsx
│   │   │   │   │   ├── 📄 CollegeAdminsCard.tsx
│   │   │   │   │   └── 📄 CollegeInfoCard.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 AddCollegeModal.tsx
│   │   │   │   ├── 📄 CollegeCard.tsx
│   │   │   │   ├── 📄 CollegesPageClient.tsx
│   │   │   │   └── 📄 EditCollegeModal.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 courses
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 CourseCard.tsx
│   │   │   │   ├── 📄 CourseSkeleton.tsx
│   │   │   │   └── 📄 CoursesPageClient.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 dashboard
│   │   │   ├── 📁 components
│   │   │   │   ├── 📁 admin
│   │   │   │   │   ├── 📁 _components
│   │   │   │   │   │   └── 📄 LoadingState.tsx
│   │   │   │   │   ├── 📄 OverviewClient.tsx
│   │   │   │   │   ├── 📄 _types.ts
│   │   │   │   │   └── 📄 data.ts
│   │   │   │   ├── 📁 manager
│   │   │   │   │   ├── 📄 ManagerOverviewClient.tsx
│   │   │   │   │   ├── 📄 _types.ts
│   │   │   │   │   └── 📄 data.ts
│   │   │   │   ├── 📄 AdminDashboard.tsx
│   │   │   │   ├── 📄 ManagerDashboard.tsx
│   │   │   │   ├── 📄 StudentDashboard.tsx
│   │   │   │   ├── 📄 SuperadminDashboard.tsx
│   │   │   │   └── 📄 TeacherDashboard.tsx
│   │   │   ├── 📄 DashboardClient.tsx
│   │   │   ├── 📄 loading.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 events
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 CreateEventModal.tsx
│   │   │   │   ├── 📄 EventCard.tsx
│   │   │   │   ├── 📄 EventDetailsDialog.tsx
│   │   │   │   └── 📄 EventsClient.tsx
│   │   │   ├── 📄 loading.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 leaderboard
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 LeaderboardEntry.tsx
│   │   │   │   └── 📄 LeaderboardPageClient.tsx
│   │   │   ├── 📁 hooks
│   │   │   │   └── 📄 use-leaderboard.ts
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 library
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 LibraryItemRow.tsx
│   │   │   │   └── 📄 LibraryPageClient.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 manager
│   │   │   ├── 📁 classes
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 ClassFormDrawer.tsx
│   │   │   │   │   ├── 📄 ClassPreview.tsx
│   │   │   │   │   ├── 📄 ClassesHeader.tsx
│   │   │   │   │   ├── 📄 ClassesList.tsx
│   │   │   │   │   └── 📄 TimetableEditorDialog.tsx
│   │   │   │   ├── 📁 hooks
│   │   │   │   │   └── 📄 use-manager-classes.ts
│   │   │   │   ├── 📁 types
│   │   │   │   │   └── 📄 classes.ts
│   │   │   │   ├── 📁 utils
│   │   │   │   │   └── 📄 classes.ts
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 overview
│   │   │   ├── 📁 students
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📁 teachers
│   │   │       └── 📄 page.tsx
│   │   ├── 📁 market
│   │   │   ├── 📁 [id]
│   │   │   │   ├── 📁 components
│   │   │   │   │   └── 📄 MarketProductPageClient.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 approvals
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 MarketApprovalsPageClient.tsx
│   │   │   │   │   ├── 📄 MarketFilters.tsx
│   │   │   │   │   ├── 📄 MarketHeader.tsx
│   │   │   │   │   ├── 📄 ProductCard.tsx
│   │   │   │   │   └── 📄 StarRating.tsx
│   │   │   │   ├── 📁 lib
│   │   │   │   │   ├── 📄 data.ts
│   │   │   │   │   └── 📄 types.ts
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 CartDrawer.tsx
│   │   │   │   ├── 📄 MarketPageClient.tsx
│   │   │   │   ├── 📄 MarketProductCard.tsx
│   │   │   │   └── 📄 PinDialog.tsx
│   │   │   ├── 📁 library
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 my-products
│   │   │   │   ├── 📁 components
│   │   │   │   │   └── 📄 MyProductsPageClient.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 orders
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 themes
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 orders
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 OrderCard.tsx
│   │   │   │   ├── 📄 OrderDetailsDrawer.tsx
│   │   │   │   ├── 📄 OrdersPageClient.tsx
│   │   │   │   └── 📄 QRCodeDrawer.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 products
│   │   │   ├── 📁 [id]
│   │   │   │   ├── 📁 components
│   │   │   │   │   └── 📄 ProductDetailsPageClient.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 ProductEditForm.tsx
│   │   │   │   ├── 📄 ProductTable.tsx
│   │   │   │   ├── 📄 ProductsApprovals.tsx
│   │   │   │   ├── 📄 ProductsClient.tsx
│   │   │   │   ├── 📄 ProductsCreator.tsx
│   │   │   │   └── 📄 ProductsManager.tsx
│   │   │   ├── 📁 sales
│   │   │   │   ├── 📁 components
│   │   │   │   │   └── 📄 ProductSalesPageClient.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📄 _types.ts
│   │   │   ├── 📄 data.ts
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 profile
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 results
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 ResultCard.tsx
│   │   │   │   ├── 📄 ResultsPageClient.tsx
│   │   │   │   └── 📄 ResultsStats.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 schedule
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 settings
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 SettingsHero.tsx
│   │   │   │   ├── 📄 SettingsProfileTab.tsx
│   │   │   │   ├── 📄 SettingsSecurityTab.tsx
│   │   │   │   ├── 📄 SettingsWalletTab.tsx
│   │   │   │   └── 📄 settings-ui.tsx
│   │   │   ├── 📁 hooks
│   │   │   │   └── 📄 use-settings-page.ts
│   │   │   ├── 📁 lib
│   │   │   │   └── 📄 settings.ts
│   │   │   ├── 📁 types
│   │   │   │   └── 📄 settings.ts
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 suggestions
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 SuggestionsManager.tsx
│   │   │   │   └── 📄 SuggestionsPortal.tsx
│   │   │   ├── 📄 SuggestionsClient.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 superadmin
│   │   │   ├── 📁 features
│   │   │   │   ├── 📁 components
│   │   │   │   │   └── 📄 SuperadminFeaturesPageClient.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📁 institutions
│   │   ├── 📁 teacher
│   │   │   ├── 📁 attendance
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 AttendanceHistoryDrawer.tsx
│   │   │   │   │   ├── 📄 AttendanceRow.tsx
│   │   │   │   │   ├── 📄 AttendanceStatCard.tsx
│   │   │   │   │   └── 📄 TeacherAttendancePageClient.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📁 audit-log
│   │   │       ├── 📁 components
│   │   │       │   ├── 📄 AuditLogCard.tsx
│   │   │       │   └── 📄 TeacherAuditLogPageClient.tsx
│   │   │       └── 📄 page.tsx
│   │   ├── 📁 tools
│   │   │   ├── 📁 components
│   │   │   │   └── 📄 ToolsPageClient.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 transactions
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 DuesCard.tsx
│   │   │   │   ├── 📄 FeePaymentForm.tsx
│   │   │   │   ├── 📄 FeeSummaryCard.tsx
│   │   │   │   ├── 📄 PaymentFailedState.tsx
│   │   │   │   ├── 📄 PaymentSuccessState.tsx
│   │   │   │   ├── 📄 PersonalTransactions.tsx
│   │   │   │   ├── 📄 StudentTransactionsView.tsx
│   │   │   │   ├── 📄 TransactionCard.tsx
│   │   │   │   ├── 📄 TransactionHistoryList.tsx
│   │   │   │   └── 📄 TransactionsClient.tsx
│   │   │   ├── 📁 hooks
│   │   │   │   ├── 📄 usePersonalTransactions.ts
│   │   │   │   └── 📄 useStudentTransactions.ts
│   │   │   ├── 📄 page.tsx
│   │   │   └── 📄 utils.ts
│   │   ├── 📁 unauthorized
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 users
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 DeleteConfirmationDialog.tsx
│   │   │   │   ├── 📄 ImportUsersDialog.tsx
│   │   │   │   ├── 📄 ManagerForm.tsx
│   │   │   │   ├── 📄 UserCard.tsx
│   │   │   │   ├── 📄 UserDetailsDrawer.tsx
│   │   │   │   ├── 📄 UserFilters.tsx
│   │   │   │   ├── 📄 UserRolesDialog.tsx
│   │   │   │   ├── 📄 UsersGrid.tsx
│   │   │   │   └── 📄 UsersPageClient.tsx
│   │   │   ├── 📄 _types.ts
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 wallet
│   │   │   ├── 📁 components
│   │   │   │   └── 📄 WalletPageClient.tsx
│   │   │   ├── 📁 payments
│   │   │   │   ├── 📁 components
│   │   │   │   │   └── 📄 WalletPaymentsPageClient.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📄 layout.tsx
│   │   ├── 📄 page-transition.tsx
│   │   └── 📄 page.tsx
│   ├── 📁 _components
│   │   └── 📁 landing
│   │       ├── 📄 AboutSection.tsx
│   │       ├── 📄 CtaSection.tsx
│   │       ├── 📄 FeaturesSection.tsx
│   │       ├── 📄 FooterSection.tsx
│   │       ├── 📄 HeroSection.tsx
│   │       ├── 📄 LandingPage.tsx
│   │       ├── 📄 Navbar.tsx
│   │       ├── 📄 RoleSwitcher.tsx
│   │       └── 📄 StatsBanner.tsx
│   ├── 📁 auth
│   │   ├── 📁 confirm
│   │   │   └── 📄 route.ts
│   │   ├── 📁 error
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 forgot-password
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 login
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 manager-login
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 sign-up
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 sign-up-success
│   │   │   └── 📄 page.tsx
│   │   └── 📁 update-password
│   │       └── 📄 page.tsx
│   ├── 📁 editor-00
│   │   └── 📄 page.tsx
│   ├── 📁 features
│   │   └── 📄 page.tsx
│   ├── 📁 offline
│   │   └── 📄 page.tsx
│   ├── 📁 protected
│   │   └── 📄 page.tsx
│   ├── 📁 sign-in
│   │   └── 📁 [[...sign-in]]
│   │       └── 📄 page.tsx
│   ├── 📁 sign-up
│   │   └── 📁 [[...sign-up]]
│   │       └── 📄 page.tsx
│   ├── 📄 favicon.ico
│   ├── 🎨 globals.css
│   ├── 📄 layout.tsx
│   ├── 📄 manifest.ts
│   └── 📄 page.tsx
├── 📁 components
│   ├── 📁 blocks
│   │   └── 📁 editor-00
│   │       ├── 📄 editor.tsx
│   │       ├── 📄 nodes.ts
│   │       └── 📄 plugins.tsx
│   ├── 📁 editor
│   │   ├── 📁 context
│   │   │   └── 📄 toolbar-context.tsx
│   │   ├── 📁 editor-hooks
│   │   │   ├── 📄 use-modal.tsx
│   │   │   └── 📄 use-update-toolbar.ts
│   │   ├── 📁 editor-ui
│   │   │   ├── 📄 content-editable.tsx
│   │   │   ├── 📄 image-component.tsx
│   │   │   └── 📄 image-resizer.tsx
│   │   ├── 📁 nodes
│   │   │   └── 📄 image-node.tsx
│   │   ├── 📁 plugins
│   │   │   ├── 📁 actions
│   │   │   │   ├── 📄 actions-plugin.tsx
│   │   │   │   ├── 📄 edit-mode-toggle-plugin.tsx
│   │   │   │   └── 📄 max-length-plugin.tsx
│   │   │   ├── 📁 toolbar
│   │   │   │   ├── 📁 block-format
│   │   │   │   │   ├── 📄 block-format-data.tsx
│   │   │   │   │   ├── 📄 format-bulleted-list.tsx
│   │   │   │   │   ├── 📄 format-check-list.tsx
│   │   │   │   │   ├── 📄 format-heading.tsx
│   │   │   │   │   ├── 📄 format-numbered-list.tsx
│   │   │   │   │   ├── 📄 format-paragraph.tsx
│   │   │   │   │   └── 📄 format-quote.tsx
│   │   │   │   ├── 📁 block-insert
│   │   │   │   │   └── 📄 insert-image.tsx
│   │   │   │   ├── 📄 block-format-toolbar-plugin.tsx
│   │   │   │   ├── 📄 clear-formatting-toolbar-plugin.tsx
│   │   │   │   ├── 📄 font-format-toolbar-plugin.tsx
│   │   │   │   └── 📄 toolbar-plugin.tsx
│   │   │   ├── 📄 auto-link-plugin.tsx
│   │   │   ├── 📄 floating-link-editor-plugin.tsx
│   │   │   ├── 📄 images-plugin.tsx
│   │   │   ├── 📄 link-plugin.tsx
│   │   │   └── 📄 list-max-indent-level-plugin.tsx
│   │   ├── 📁 shared
│   │   │   └── 📄 can-use-dom.ts
│   │   ├── 📁 themes
│   │   │   └── 📄 editor-theme.ts
│   │   ├── 📁 transformers
│   │   │   └── 📄 markdown-image-transformer.ts
│   │   └── 📁 utils
│   │       ├── 📄 get-selected-node.ts
│   │       ├── 📄 set-floating-elem-position-for-link-editor.ts
│   │       └── 📄 url.ts
│   ├── 📁 hand-drawn
│   │   ├── 📄 button.tsx
│   │   ├── 📄 card.tsx
│   │   ├── 📄 input.tsx
│   │   └── 📄 label.tsx
│   ├── 📁 layout
│   │   ├── 📄 app-sidebar.tsx
│   │   ├── 📄 main-navbar.tsx
│   │   ├── 📄 mobile-bottom-nav.tsx
│   │   ├── 📄 sidebarData.ts
│   │   └── 📄 sidebarItems.ts
│   ├── 📁 providers
│   │   ├── 📄 notification-provider.tsx
│   │   └── 📄 permissions-provider.tsx
│   ├── 📁 pwa
│   │   └── 📄 ServiceWorkerRegister.tsx
│   ├── 📁 shell
│   │   ├── 📄 NotificationsBell.tsx
│   │   └── 📄 logout-button.tsx
│   ├── 📁 ui
│   │   ├── 📄 alert-dialog.tsx
│   │   ├── 📄 avatar.tsx
│   │   ├── 📄 badge.tsx
│   │   ├── 📄 breadcrumb.tsx
│   │   ├── 📄 button-group.tsx
│   │   ├── 📄 button.tsx
│   │   ├── 📄 calendar.tsx
│   │   ├── 📄 card.tsx
│   │   ├── 📄 chart.tsx
│   │   ├── 📄 checkbox.tsx
│   │   ├── 📄 combobox.tsx
│   │   ├── 📄 context-menu.tsx
│   │   ├── 📄 dialog.tsx
│   │   ├── 📄 drawer.tsx
│   │   ├── 📄 dropdown-menu.tsx
│   │   ├── 📄 field.tsx
│   │   ├── 📄 input-group.tsx
│   │   ├── 📄 input-otp.tsx
│   │   ├── 📄 input.tsx
│   │   ├── 📄 item.tsx
│   │   ├── 📄 label.tsx
│   │   ├── 📄 pagination.tsx
│   │   ├── 📄 popover.tsx
│   │   ├── 📄 progress.tsx
│   │   ├── 📄 scroll-area.tsx
│   │   ├── 📄 select.tsx
│   │   ├── 📄 separator.tsx
│   │   ├── 📄 sheet.tsx
│   │   ├── 📄 sidebar.tsx
│   │   ├── 📄 skeleton.tsx
│   │   ├── 📄 slider.tsx
│   │   ├── 📄 sonner.tsx
│   │   ├── 📄 spinner.tsx
│   │   ├── 📄 switch.tsx
│   │   ├── 📄 table.tsx
│   │   ├── 📄 tabs.tsx
│   │   ├── 📄 textarea.tsx
│   │   ├── 📄 toggle-group.tsx
│   │   ├── 📄 toggle.tsx
│   │   └── 📄 tooltip.tsx
│   ├── 📄 achievement.tsx
│   ├── 📄 chat-image-preview.tsx
│   ├── 📄 chat-message.tsx
│   ├── 📄 component-example.tsx
│   ├── 📄 dashboard-content.tsx
│   ├── 📄 dropzone.tsx
│   ├── 📄 example.tsx
│   ├── 📄 qr-code-display.tsx
│   ├── 📄 qr-scanner.tsx
│   ├── 📄 realtime-chat.tsx
│   ├── 📄 theme-switcher.tsx
│   ├── 📄 ui-mode-toggle.tsx
│   └── 📄 user-profile-card.tsx
├── 📁 context
│   ├── 📄 theme.tsx
│   └── 📄 ui-mode.tsx
├── 📁 data
│   └── 📄 landing.ts
├── 📁 features
│   ├── 📁 admin
│   │   └── 📁 components
│   │       ├── 📁 form
│   │       │   ├── 📄 FormInput.tsx
│   │       │   ├── 📄 FormSelect.tsx
│   │       │   └── 📄 FormTextarea.tsx
│   │       ├── 📄 AdminComponents.ts
│   │       ├── 📄 ConfirmDialog.tsx
│   │       ├── 📄 CrudDrawer.tsx
│   │       ├── 📄 CrudModal.tsx
│   │       ├── 📄 DataTable.tsx
│   │       ├── 📄 RoleBadge.tsx
│   │       ├── 📄 SectionHeader.tsx
│   │       └── 📄 StatCard.tsx
│   ├── 📁 assignments
│   │   ├── 📁 components
│   │   │   ├── 📄 AssessmentCreationForm.tsx
│   │   │   ├── 📄 AssessmentHistory.tsx
│   │   │   ├── 📄 AssessmentResultsTab.tsx
│   │   │   ├── 📄 AssignmentCard.tsx
│   │   │   ├── 📄 AssignmentForm.tsx
│   │   │   ├── 📄 AssignmentSubmitDrawer.tsx
│   │   │   ├── 📄 AssignmentViewDialog.tsx
│   │   │   ├── 📄 AssignmentsAdminView.tsx
│   │   │   ├── 📄 AssignmentsHeader.tsx
│   │   │   ├── 📄 AssignmentsPageClient.tsx
│   │   │   ├── 📄 AssignmentsTabs.tsx
│   │   │   ├── 📄 GradingTable.tsx
│   │   │   ├── 📄 PreviousSubmissionsTable.tsx
│   │   │   ├── 📄 ResultEntryDrawer.tsx
│   │   │   ├── 📄 StudentAssignmentsView.tsx
│   │   │   └── 📄 TeacherAssessmentWorkspace.tsx
│   │   ├── 📁 hooks
│   │   │   └── 📄 use-assignments.ts
│   │   ├── 📄 assignment-types.ts
│   │   └── 📄 assignment-utils.ts
│   ├── 📁 auth
│   │   └── 📁 components
│   │       ├── 📄 forgot-password-form.tsx
│   │       ├── 📄 login-form.tsx
│   │       ├── 📄 sign-up-form.tsx
│   │       └── 📄 update-password-form.tsx
│   ├── 📁 calendar
│   │   └── 📁 components
│   │       ├── 📄 CalendarFilters.tsx
│   │       ├── 📄 CalendarHeader.tsx
│   │       └── 📄 CalendarView.tsx
│   ├── 📁 chat
│   │   ├── 📁 components
│   │   │   ├── 📁 search
│   │   │   │   └── 📄 MessageItem.tsx
│   │   │   ├── 📄 ChannelHeader.tsx
│   │   │   ├── 📄 ChatArea.tsx
│   │   │   ├── 📄 ChatMembersPanels.tsx
│   │   │   ├── 📄 ChatMessageItem.tsx
│   │   │   ├── 📄 ChatMessagePane.tsx
│   │   │   ├── 📄 ChatMobileSearch.tsx
│   │   │   ├── 📄 ChatPrimitives.tsx
│   │   │   ├── 📄 MembersSidebar.tsx
│   │   │   ├── 📄 MessageInput.tsx
│   │   │   ├── 📄 MessageItem.tsx
│   │   │   └── 📄 ProfileDialog.tsx
│   │   ├── 📁 hooks
│   │   │   ├── 📄 use-chat-page.ts
│   │   │   ├── 📄 use-chat-scroll.tsx
│   │   │   ├── 📄 use-realtime-chat.tsx
│   │   │   └── 📄 useChatMessages.ts
│   │   ├── 📄 chat-page-types.ts
│   │   ├── 📄 chat-page-utils.ts
│   │   ├── 📄 data.ts
│   │   └── 📄 utils.ts
│   ├── 📁 dashboard
│   │   ├── 📁 components
│   │   │   ├── 📄 AchievementCard.tsx
│   │   │   ├── 📄 Announcements.tsx
│   │   │   ├── 📄 AnnouncementsCard.tsx
│   │   │   ├── 📄 AttendanceCard.tsx
│   │   │   ├── 📄 CurrentDate.tsx
│   │   │   ├── 📄 DailyRewardCard.tsx
│   │   │   ├── 📄 FeeStatusCard.tsx
│   │   │   ├── 📄 LeaderboardCard.tsx
│   │   │   ├── 📄 LevelWidget.tsx
│   │   │   ├── 📄 MyTasksCard.tsx
│   │   │   ├── 📄 RecentGrades.tsx
│   │   │   ├── 📄 StatsCards.tsx
│   │   │   ├── 📄 StudentDashboardNewView.tsx
│   │   │   ├── 📄 UpcomingEventsCard.tsx
│   │   │   ├── 📄 UpcomingExamsAlert.tsx
│   │   │   └── 📄 WalletMiniCard.tsx
│   │   ├── 📁 config
│   │   │   └── 📄 rewards.ts
│   │   ├── 📄 data.ts
│   │   ├── 📄 types.ts
│   │   └── 📄 utils.ts
│   ├── 📁 grading
│   │   ├── 📁 components
│   │   │   ├── 📄 AssignmentForm.tsx
│   │   │   ├── 📄 AssignmentSelector.tsx
│   │   │   ├── 📄 GradeDialog.tsx
│   │   │   ├── 📄 SubmissionCard.tsx
│   │   │   ├── 📄 SubmissionFilters.tsx
│   │   │   └── 📄 TeacherGradingView.tsx
│   │   ├── 📁 hooks
│   │   │   └── 📄 use-grading.ts
│   │   └── 📄 index.ts
│   ├── 📁 schedule
│   │   ├── 📁 components
│   │   │   └── 📄 WeeklySchedulePanel.tsx
│   │   └── 📄 data.ts
│   ├── 📁 transactions
│   │   └── 📁 components
│   │       ├── 📄 FinanceTransactionsWorkspace.tsx
│   │       └── 📄 ManualTransactionForm.tsx
│   └── 📁 wallet
│       ├── 📁 components
│       │   ├── 📄 BalanceCard.tsx
│       │   ├── 📄 Dialogs.tsx
│       │   ├── 📄 PendingRequestsDrawer.tsx
│       │   ├── 📄 ReceiveMoneyDrawer.tsx
│       │   ├── 📄 RequestMoneyDrawer.tsx
│       │   ├── 📄 ScanPayDrawer.tsx
│       │   ├── 📄 SendMoneyCard.tsx
│       │   ├── 📄 SendMoneyDrawer.tsx
│       │   ├── 📄 SpendingsChart.tsx
│       │   ├── 📄 TransactionHistory.tsx
│       │   ├── 📄 TransactionReceiptDrawer.tsx
│       │   └── 📄 WalletHero.tsx
│       ├── 📁 hooks
│       ├── 📄 data.ts
│       └── 📄 utils.ts
├── 📁 hooks
│   ├── 📄 use-chat-unread-count.ts
│   ├── 📄 use-cloudinary-upload.ts
│   ├── 📄 use-mobile.ts
│   ├── 📄 use-supabase-upload.ts
│   ├── 📄 use-user.ts
│   └── 📄 usePushNotifications.ts
├── 📁 lib
│   ├── 📁 types
│   │   └── 📄 api.ts
│   ├── 📄 file-url.ts
│   ├── 📄 server.ts
│   ├── 📄 socket.ts
│   ├── 📄 subject-progress.ts
│   ├── 📄 utils.ts
│   └── 📄 validation.ts
├── 📁 public
│   ├── 🖼️ apple-icon-180.png
│   ├── 🖼️ apple-splash-1125-2436.jpg
│   ├── 🖼️ apple-splash-1136-640.jpg
│   ├── 🖼️ apple-splash-1170-2532.jpg
│   ├── 🖼️ apple-splash-1179-2556.jpg
│   ├── 🖼️ apple-splash-1206-2622.jpg
│   ├── 🖼️ apple-splash-1242-2208.jpg
│   ├── 🖼️ apple-splash-1242-2688.jpg
│   ├── 🖼️ apple-splash-1260-2736.jpg
│   ├── 🖼️ apple-splash-1284-2778.jpg
│   ├── 🖼️ apple-splash-1290-2796.jpg
│   ├── 🖼️ apple-splash-1320-2868.jpg
│   ├── 🖼️ apple-splash-1334-750.jpg
│   ├── 🖼️ apple-splash-1488-2266.jpg
│   ├── 🖼️ apple-splash-1536-2048.jpg
│   ├── 🖼️ apple-splash-1620-2160.jpg
│   ├── 🖼️ apple-splash-1640-2360.jpg
│   ├── 🖼️ apple-splash-1668-2224.jpg
│   ├── 🖼️ apple-splash-1668-2388.jpg
│   ├── 🖼️ apple-splash-1792-828.jpg
│   ├── 🖼️ apple-splash-2048-1536.jpg
│   ├── 🖼️ apple-splash-2048-2732.jpg
│   ├── 🖼️ apple-splash-2160-1620.jpg
│   ├── 🖼️ apple-splash-2208-1242.jpg
│   ├── 🖼️ apple-splash-2224-1668.jpg
│   ├── 🖼️ apple-splash-2266-1488.jpg
│   ├── 🖼️ apple-splash-2360-1640.jpg
│   ├── 🖼️ apple-splash-2388-1668.jpg
│   ├── 🖼️ apple-splash-2436-1125.jpg
│   ├── 🖼️ apple-splash-2532-1170.jpg
│   ├── 🖼️ apple-splash-2556-1179.jpg
│   ├── 🖼️ apple-splash-2622-1206.jpg
│   ├── 🖼️ apple-splash-2688-1242.jpg
│   ├── 🖼️ apple-splash-2732-2048.jpg
│   ├── 🖼️ apple-splash-2736-1260.jpg
│   ├── 🖼️ apple-splash-2778-1284.jpg
│   ├── 🖼️ apple-splash-2796-1290.jpg
│   ├── 🖼️ apple-splash-2868-1320.jpg
│   ├── 🖼️ apple-splash-640-1136.jpg
│   ├── 🖼️ apple-splash-750-1334.jpg
│   ├── 🖼️ apple-splash-828-1792.jpg
│   ├── 🖼️ bcoin.svg
│   ├── 🖼️ favicon-196.png
│   ├── 🖼️ file.svg
│   ├── 🖼️ globe.svg
│   ├── 🖼️ logo-dark.png
│   ├── 🖼️ logo-white.png
│   ├── 🖼️ manifest-icon-192.maskable.png
│   ├── 🖼️ manifest-icon-512.maskable.png
│   ├── 🖼️ next.svg
│   ├── 📄 robots.txt
│   ├── ⚙️ sitemap.xml
│   ├── 📄 sw.js
│   ├── 🖼️ vercel.svg
│   └── 🖼️ window.svg
├── 📁 services
│   ├── 📁 api
│   │   ├── 📄 academic.service.ts
│   │   ├── 📄 auth.service.ts
│   │   ├── 📄 base.ts
│   │   ├── 📄 chat.service.ts
│   │   ├── 📄 client.ts
│   │   ├── 📄 communication.service.ts
│   │   ├── 📄 dashboard.service.ts
│   │   ├── 📄 finance.service.ts
│   │   ├── 📄 gamification.service.ts
│   │   ├── 📄 hooks.ts
│   │   ├── 📄 market.service.ts
│   │   ├── 📄 notification.service.ts
│   │   ├── 📄 server-api.ts
│   │   ├── 📄 sidebar.ts
│   │   ├── 📄 system.service.ts
│   │   └── 📄 user.service.ts
│   ├── 📁 supabase
│   │   ├── 📄 client.ts
│   │   └── 📄 server.ts
│   └── 📄 shared-data.ts
├── 📁 themes
│   └── 📄 index.ts
├── ⚙️ .gitignore
├── 📝 README.md
├── ⚙️ components.json
├── 📄 eslint.config.mjs
├── 📄 next.config.ts
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 postcss.config.mjs
├── 📄 proxy.ts
├── 📄 tailwind.config.ts
└── ⚙️ tsconfig.json
```

---
*Generated by FileTree Pro Extension*