-- Fixed operating requirement: keep mail dispatch at 10 seconds.
-- Change only after an explicit new instruction from the owner.
select cron.alter_job(jobid, schedule := '10 seconds')
from cron.job where jobname = 'laperle_mail';
