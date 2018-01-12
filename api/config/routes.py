
def register():
    """
        declare routes as follows: 'module.PluralNameClass@endpoint': 'route'
    """
    return {
        'users.Users@users_url': '/user',
        'users.UsersManager@users_manager_url': '/users',
        'users.Session@login_url': '/login',
        'users.Roles@roles_url': '/roles',
        'users.Permissions@permissions_url': '/permissions'
    }
