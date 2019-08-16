import eventlet
import os

patched = False

if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
    eventlet.monkey_patch()
    patched = eventlet.patcher.is_monkey_patched('thread')
