Always convert local time to UTC while sending to backend , since luxon DateTime keeps the local offset, hence always remember to send UTC to backend, but think about floating times and timezone aware offsets for later

# Time Conventions

### DueDate:

every todo with a date fixed has this field be it a timed todo or an untimed one

### DueAt:

only timed todo has this field

## continue from bug of nextIndex having the previous vlaue ionstead of the new one
