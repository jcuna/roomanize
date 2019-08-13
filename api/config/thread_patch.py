import eventlet
eventlet.monkey_patch()
patched = eventlet.patcher.is_monkey_patched('thread')
