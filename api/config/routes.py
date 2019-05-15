
def register():
    """
        declare menuItems as follows: 'module.PluralNameClass@endpoint': 'route'
        returns: dict
    """
    return {
        'users.Users@users_url': '/user|/user/',
        'users.UsersManager@users_manager_url': '/users|/users/<int:user_id>',
        'users.Session@login_url': '/login|/login/',
        'users.Roles@roles_url': '/roles|/roles/',
        'users.Permissions@permissions_url': '/permissions|/permissions/',
        'users.UserTokens@user_tokens_url': '/user-tokens|/user-tokens/<user_token>',
        'users.Activate@user_activate_url': '/account/activate-pass',

        'projects.Projects@projects_url': '/projects|/projects/|/projects/<int:project_id>',
        'projects.Rooms@rooms_url': '/rooms|/rooms/|/rooms/<int:room_id>',
        'projects.TimeIntervals@time_intervals_url': '/time-intervals|/time-intervals/',

        'agreements.Agreements@agreements_url': '/agreements|/agreements/|/agreements/<int:agreement_id>',
        'agreements.Policies@policies_url': '/policies|/policies/<int:policy_id>',

        'tenants.Tenants@tenants_url': '/tenants|/tenants/|/tenants/<int:tenant_id>',
    }


no_permissions = [
    'views.users.Session',
    'views.users.Users',
    'views.users.UserTokens',
    'views.users.Permissions',
    'views.users.Activate',
    'views.projects.TimeIntervals',
]

default_access = {
    'views.projects.Projects': ['read']
}
