def register():
    """
        declare menuItems as follows: 'module.PluralNameClass@endpoint': 'route'
        returns: dict
    """
    return {
        'users.Users@users_url': '/user',
        'users.UsersManager@users_manager_url': '/users|/users/<int:user_id>',
        'users.Session@login_url': '/login',
        'users.Roles@roles_url': '/roles',
        'users.Permissions@permissions_url': '/permissions',
        'users.UserTokens@user_tokens_url': '/user-tokens|/user-tokens/<user_token>',
        'users.Activate@user_activate_url': '/account/activate-pass',
        'users.Audit@audit_url': '/audit|/audit/<int:user_id>',

        'company.Company@company_url': '/company',

        'projects.Projects@projects_url': '/projects|/projects/<int:project_id>',
        'projects.Rooms@rooms_url': '/rooms|/rooms/<int:room_id>',
        'projects.RoomsHistory@rooms_history_url': '/rooms-history/|/rooms-history/<int:room_id>',
        'projects.TimeIntervals@time_intervals_url': '/time-intervals',
        'projects.PaymentTypes@payment_types_url': '/payment-types',

        'agreements.Agreements@agreements_url': '/agreements|/agreements/<int:agreement_id>',
        'agreements.Policies@policies_url': '/policies|/policies/<int:policy_id>',
        'agreements.BalancePayments@balance_payments_url': '/pay-balance|/pay-balance/<int:agreement_id>',
        'agreements.Receipts@receipts_url': '/receipts',

        'tenants.Tenants@tenants_url': '/tenants|/tenants/<int:tenant_id>',

        'expenses.Expenses@expenses_url': '/expenses|/expenses/<int:expense_id>',
        'expenses.ExpenseScans@expense_scans_url': '/expense-scans|/expense-scans/<string:token>/<int:expense_id>',

        'emails.Email@emails_url': '/email|/email/<string:action>',
    }


no_permissions = [
    'views.users.Session',
    'views.users.Users',
    'views.users.UserTokens',
    'views.users.Permissions',
    'views.users.Activate',
    'views.projects.TimeIntervals',
    'views.projects.PaymentTypes',
    'views.expenses.ExpenseScans',
    'views.emails.Email',
]

default_access = {
    'views.projects.Projects': ['read'],
    'views.agreements.Receipts': ['read'],
    'views.company.Company': ['read'],
}
