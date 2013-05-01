var charm = require('../')(process);

charm
    .column(16)
    .write('beep')
    .down()
    .column(32)
    .write('boop\n')
    .destroy()
;
