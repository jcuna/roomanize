
def register():
    """
        declare routes as follows: 'module.PluralNameClass@endpoint': 'route'
    """
    return {
        'users.Users@user_url': '/user',
        'users.Login@login_url': '/login'
    }
