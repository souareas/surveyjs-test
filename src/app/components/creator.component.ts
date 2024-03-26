import { AfterViewInit, Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { ComponentCollection, Model, Serializer, surveyLocalization } from 'survey-core';
import { IQuestionToolboxItem, QuestionConvertMode, settings, SurveyCreatorModel } from 'survey-creator-core';
import { json } from '../survey';
import 'survey-core/survey.i18n';
import 'survey-creator-core/survey-creator-core.i18n';

settings.questionConvertMode = QuestionConvertMode.CompatibleTypes;

ComponentCollection.Instance.add({
  name: "fullname",
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

const fullNameItemToolboxItem:  IQuestionToolboxItem = {
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

@Component({
  selector: "component-survey-creator",
  templateUrl: "./creator.component.html",
  styleUrls: ["./creator.component.css"],
})
export class SurveyCreatorComponent implements OnInit, AfterViewInit {
  public model?: SurveyCreatorModel;
  public model2!: Model;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}
  
  ngOnInit() {    
    const creator = new SurveyCreatorModel({
      showLogicTab: true,
      showJSONEditorTab: true,
      pageEditMode: "bypage",
    });
    
    creator.isAutoSave = true;
    creator.toolbox.allowExpandMultipleCategories = true;
    creator.toolbox.showCategoryTitles = true;

    creator.JSON = json;

    creator.onQuestionAdded.add((_, options) => {
      if (options.question.getType() === "fullname") {
        creator.toolbox.removeItem("fullname");
      }
    });

    creator.toolbox.addItem(fullNameItemToolboxItem)

    creator.onElementDeleting.add((_, options) => {
      if (options.element.getType() === "fullname") {

        const item: IQuestionToolboxItem = creator.toolbox.getItemByName('fullname');
        console.log({item})

        if(!item) {
          creator.toolbox.addItem(fullNameItemToolboxItem)
        }
      }
    });

    this.model = creator;
  }

  ngAfterViewInit(): void {
    const elementLicence = this.elementRef.nativeElement.querySelector('.svc-creator__banner');
    if (elementLicence) {
      this.renderer.setStyle(elementLicence, 'display', 'none');
    }
  }
}
