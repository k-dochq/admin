#!/bin/bash

# 나머지 테이블들을 간단하게 내보내기
psql -d drmiracle_analysis -c "COPY (SELECT * FROM bookmark) TO '/Users/kdoc/kdoc-workspace/admin/prisma/data-migration/csv-data/bookmark.csv' WITH CSV HEADER;"
psql -d drmiracle_analysis -c "COPY (SELECT * FROM chat ORDER BY \"createdAt\") TO '/Users/kdoc/kdoc-workspace/admin/prisma/data-migration/csv-data/chat.csv' WITH CSV HEADER;"
psql -d drmiracle_analysis -c "COPY (SELECT * FROM chat_room ORDER BY \"createdAt\") TO '/Users/kdoc/kdoc-workspace/admin/prisma/data-migration/csv-data/chat_room.csv' WITH CSV HEADER;"
psql -d drmiracle_analysis -c "COPY (SELECT * FROM chat_room_user ORDER BY \"joinedAt\") TO '/Users/kdoc/kdoc-workspace/admin/prisma/data-migration/csv-data/chat_room_user.csv' WITH CSV HEADER;"
psql -d drmiracle_analysis -c "COPY (SELECT * FROM consulting ORDER BY \"createdAt\") TO '/Users/kdoc/kdoc-workspace/admin/prisma/data-migration/csv-data/consulting.csv' WITH CSV HEADER;"
psql -d drmiracle_analysis -c "COPY (SELECT * FROM car_service ORDER BY \"createdAt\") TO '/Users/kdoc/kdoc-workspace/admin/prisma/data-migration/csv-data/car_service.csv' WITH CSV HEADER;"
psql -d drmiracle_analysis -c "COPY (SELECT * FROM car_service_slot ORDER BY \"createdAt\") TO '/Users/kdoc/kdoc-workspace/admin/prisma/data-migration/csv-data/car_service_slot.csv' WITH CSV HEADER;"
psql -d drmiracle_analysis -c "COPY (SELECT * FROM appointment ORDER BY \"createdAt\") TO '/Users/kdoc/kdoc-workspace/admin/prisma/data-migration/csv-data/appointment.csv' WITH CSV HEADER;"
psql -d drmiracle_analysis -c "COPY (SELECT * FROM admin_user ORDER BY \"createdAt\") TO '/Users/kdoc/kdoc-workspace/admin/prisma/data-migration/csv-data/admin_user.csv' WITH CSV HEADER;"
psql -d drmiracle_analysis -c "COPY (SELECT * FROM payment ORDER BY \"createdAt\") TO '/Users/kdoc/kdoc-workspace/admin/prisma/data-migration/csv-data/payment.csv' WITH CSV HEADER;"
psql -d drmiracle_analysis -c "COPY (SELECT * FROM user_report ORDER BY \"createdAt\") TO '/Users/kdoc/kdoc-workspace/admin/prisma/data-migration/csv-data/user_report.csv' WITH CSV HEADER;"

echo "모든 테이블 내보내기 완료!"
