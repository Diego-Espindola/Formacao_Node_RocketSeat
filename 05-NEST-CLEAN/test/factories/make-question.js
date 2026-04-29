"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeQuestion = makeQuestion;
const faker_1 = require("@faker-js/faker");
const unique_entity_id_js_1 = require("@/core/entities/unique-entity-id.js");
const question_js_1 = require("@/domain/forum/enterprise/entities/question.js");
function makeQuestion(override = {}, id) {
    const question = question_js_1.Question.create({
        authorId: new unique_entity_id_js_1.UniqueEntityID(),
        title: faker_1.faker.lorem.sentence(),
        content: faker_1.faker.lorem.text(),
        ...override,
    }, id);
    return question;
}
//# sourceMappingURL=make-question.js.map