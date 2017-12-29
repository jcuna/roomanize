
def register():
    """
        declare routes as follows: 'module.PluralNameClass@endpoint': 'route'
    """
    return {
        'users.Users@users_url': '/user',
        'users.Session@login_url': '/login',
        'users.Roles@roles_url': '/roles'
    }
