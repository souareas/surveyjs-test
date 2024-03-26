import { ComponentCollection, Serializer } from 'survey-core';
import { IQuestionToolboxItem } from 'survey-creator-core';

export const addFullNameCollection = () => {
  const questionName: string = 'fullname';

  if(!ComponentCollection.Instance.getCustomQuestionByName(questionName)) {
    ComponentCollection.Instance.add({
      name: questionName,
      title: "Full Name",
      showInToolbox: false,
      elementsJSON: [
          {
              type: "text",
              name: "firstName",
              title: "First Name",
              isRequired: true,
              minWidth: 200
          },
          {
              type: "text",
              name: "lastName",
              title: "Last Name",
              isRequired: true,
              minWidth: 200,
              startWithNewLine: false,
          },
          {
              type: "text",
              name: "middleName",
              title: "Middle Name",
              startWithNewLine: false,
              visible: false,
          },
      ],
      onInit() {
          Serializer.addProperty("fullname", {
              name: "showMiddleName:boolean",
              default: false,
              category: "general",
          });
      },
      onLoaded(question: any) {
          changeMiddleVisibility(question);
      },
      onPropertyChanged(question: any, propertyName: any, newValue: any) {
          if (propertyName == "showMiddleName") {
              changeMiddleVisibility(question);
          }
      },
    });
    
    const changeMiddleVisibility = (question: any) => {
      let middle = question.contentPanel.getQuestionByName("middleName");
      if (!!middle) {
          middle.visible = question.showMiddleName === true;
      }
    }
  }
}

export const fullNameItemToolboxItem:  IQuestionToolboxItem = {
  name: 'fullname',
  title: "Full Name",
  isCopied: true,
  iconName: 'icon-text',
  category: '',
  className: 'fullname',
  json: {
    type: 'fullname',
  }
}

export const EnumSurveyCustom = {
  fullname: fullNameItemToolboxItem
};

export const isUniqueToolbox: string[] = [
  'fullname'
];
