FROM node
EXPOSE 7001
COPY ./* /var/be/dist/

RUN npm install
CMD cd /var/be/dist && npx sequelize db:migrate && npm run start